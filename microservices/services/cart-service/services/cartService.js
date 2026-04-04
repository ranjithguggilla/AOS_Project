import cartRepository from '../repositories/cartRepository.js'
import { getCache, setCache, deleteCache } from '../../../shared/redisClient.js'

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const cacheKey = (userId) => `cart:user:${userId}`

const addItem = async (userId, item) => {
  if (!userId || !item?.productId) {
    throw createHttpError(400, 'userId and item.productId are required')
  }

  const cart =
    (await cartRepository.findByUserId(userId)) ||
    (await cartRepository.create({ userId, items: [] }))

  const existingIndex = cart.items.findIndex((entry) => entry.productId === item.productId)
  if (existingIndex >= 0) {
    cart.items[existingIndex].qty += item.qty || 1
  } else {
    cart.items.push({ ...item, qty: item.qty || 1 })
  }

  await cart.save()
  await deleteCache(cacheKey(userId))
  return cart
}

const removeItem = async (userId, productId) => {
  if (!userId || !productId) {
    throw createHttpError(400, 'userId and productId are required')
  }

  const cart = await cartRepository.findByUserId(userId)
  if (!cart) {
    throw createHttpError(404, 'Cart not found')
  }

  cart.items = cart.items.filter((item) => item.productId !== productId)
  await cart.save()
  await deleteCache(cacheKey(userId))
  return cart
}

const clearCart = async (userId) => {
  if (!userId) {
    throw createHttpError(400, 'userId is required')
  }

  const cart = await cartRepository.findByUserId(userId)
  if (!cart) {
    return { userId, items: [] }
  }

  cart.items = []
  await cart.save()
  await deleteCache(cacheKey(userId))
  return cart
}

const updateItem = async (userId, productId, qty) => {
  if (!userId || !productId || typeof qty !== 'number') {
    throw createHttpError(400, 'userId, productId and qty are required')
  }

  const cart = await cartRepository.findByUserId(userId)
  if (!cart) {
    throw createHttpError(404, 'Cart not found')
  }

  const item = cart.items.find((entry) => entry.productId === productId)
  if (!item) {
    throw createHttpError(404, 'Cart item not found')
  }

  item.qty = qty
  await cart.save()
  await deleteCache(cacheKey(userId))
  return cart
}

const getCart = async (userId) => {
  const key = cacheKey(userId)
  const cached = await getCache(key)
  if (cached) {
    return JSON.parse(cached)
  }

  const cart = await cartRepository.findByUserId(userId)
  const response = cart || { userId, items: [] }
  await setCache(key, JSON.stringify(response), 90)
  return response
}

export default { addItem, removeItem, clearCart, updateItem, getCart }
