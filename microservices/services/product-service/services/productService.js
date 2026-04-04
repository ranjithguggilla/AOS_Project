import mongoose from 'mongoose'
import productRepository from '../repositories/productRepository.js'
import { getCache, setCache, deleteCacheByPrefix } from '../../../shared/redisClient.js'

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const ensureValidObjectId = (id, notFoundMessage = 'Product not found') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(404, notFoundMessage)
  }
}

const resolveProductFromItem = async (item) => {
  if (item?.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
    const byId = await productRepository.findById(item.productId)
    if (byId) {
      return byId
    }
  }

  if (item?.name) {
    const byName = await productRepository.findByExactNameInsensitive(item.name)
    if (byName) {
      return byName
    }
  }

  return null
}

const searchProducts = async (keyword = '') => {
  const cacheKey = `product:search:${String(keyword).toLowerCase()}`
  const cached = await getCache(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const products = await productRepository.findByNameLike(keyword)
  await setCache(cacheKey, JSON.stringify(products), 120)
  return products
}

const listProducts = async ({ category, keyword }) => {
  const normalizedCategory = category ? String(category).toLowerCase() : ''
  const normalizedKeyword = keyword ? String(keyword).toLowerCase() : ''
  const cacheKey = `product:list:${normalizedCategory}:${normalizedKeyword}`

  const cached = await getCache(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const filter = {}
  if (category) {
    filter.category = category
  }
  if (keyword) {
    filter.name = { $regex: keyword, $options: 'i' }
  }

  const products = await productRepository.findByFilter(filter)
  await setCache(cacheKey, JSON.stringify(products), 120)
  return products
}

const getProductById = async (id) => {
  ensureValidObjectId(id)

  const cacheKey = `product:detail:${id}`
  const cached = await getCache(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const product = await productRepository.findById(id)
  if (!product) {
    throw createHttpError(404, 'Product not found')
  }

  await setCache(cacheKey, JSON.stringify(product), 180)
  return product
}

const createProduct = async (body) => {
  const defaultName = `Sample Product ${Date.now()}`
  const payload = {
    ...body,
    name: body.name || defaultName,
    description: body.description || 'Sample description',
    category: Array.isArray(body.category) ? body.category : [body.category || 'General'],
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    price: typeof body.price === 'number' ? body.price : 0,
    countInStock: typeof body.countInStock === 'number' ? body.countInStock : 0,
    images: Array.isArray(body.images) ? body.images : []
  }

  const product = await productRepository.create(payload)
  await deleteCacheByPrefix('product:')
  return product
}

const updateProduct = async (id, body) => {
  ensureValidObjectId(id)

  const product = await productRepository.findById(id)
  if (!product) {
    throw createHttpError(404, 'Product not found')
  }

  product.name = body.name ?? product.name
  product.description = body.description ?? product.description
  product.category = Array.isArray(body.category)
    ? body.category
    : body.category
      ? [body.category]
      : product.category
  product.sizes = Array.isArray(body.sizes) ? body.sizes : product.sizes
  product.price = typeof body.price === 'number' ? body.price : product.price
  product.countInStock = typeof body.countInStock === 'number' ? body.countInStock : product.countInStock
  product.images = Array.isArray(body.images) ? body.images : product.images

  const updatedProduct = await product.save()
  await deleteCacheByPrefix('product:')
  return updatedProduct
}

const deleteProduct = async (id) => {
  ensureValidObjectId(id)

  const product = await productRepository.findById(id)
  if (!product) {
    throw createHttpError(404, 'Product not found')
  }

  await productRepository.deleteOne(product)
  await deleteCacheByPrefix('product:')
}

const checkStock = async (items) => {
  if (!Array.isArray(items)) {
    throw createHttpError(400, 'items must be an array')
  }

  const checks = await Promise.all(
    items.map(async (item) => {
      const product = await resolveProductFromItem(item)
      if (!product) {
        return {
          productId: item.productId,
          available: false,
          reason: 'Product not found'
        }
      }

      if (product.countInStock < item.qty) {
        return {
          productId: item.productId,
          resolvedProductId: product._id,
          available: false,
          reason: 'Out of stock',
          stock: product.countInStock
        }
      }

      return {
        productId: item.productId,
        resolvedProductId: product._id,
        available: true,
        stock: product.countInStock
      }
    })
  )

  return {
    allAvailable: checks.every((item) => item.available),
    checks
  }
}

const decrementStock = async (items) => {
  if (!Array.isArray(items)) {
    throw createHttpError(400, 'items must be an array')
  }

  await Promise.all(
    items.map(async (item) => {
      const product = await resolveProductFromItem(item)
      if (!product) {
        return
      }

      await productRepository.updateByIdIncStock(product._id, item.qty)
    })
  )

  await deleteCacheByPrefix('product:')
}

export default {
  searchProducts,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  checkStock,
  decrementStock
}