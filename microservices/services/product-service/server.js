import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import connectDB from '../../shared/connectDB.js'
import { getCache, setCache, deleteCacheByPrefix } from '../../shared/redisClient.js'
import { metricsMiddleware, metricsHandler, productsViewedTotal } from '../../shared/metrics.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('product-service'))

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: [{ type: String, required: true }],
    sizes: [{ type: String }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        name: { type: String },
        rating: { type: Number },
        comment: { type: String },
        userId: { type: String }
      }
    ],
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    images: [{ type: String }]
  },
  { timestamps: true }
)

const Product = mongoose.model('Product', productSchema)

const requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  try {
    const token = authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abc123')
    if (!decoded?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }

    req.user = decoded
    next()
  } catch (_error) {
    return res.status(401).json({ message: 'Not authorized' })
  }
}

const resolveProductFromItem = async (item) => {
  if (item?.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
    const byId = await Product.findById(item.productId)
    if (byId) {
      return byId
    }
  }

  if (item?.name) {
    const byName = await Product.findOne({
      name: { $regex: `^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    })
    if (byName) {
      return byName
    }
  }

  return null
}

app.get('/api/products/search', async (req, res) => {
  const keyword = req.query.keyword || ''
  const cacheKey = `product:search:${keyword.toLowerCase()}`

  const cached = await getCache(cacheKey)
  if (cached) {
    return res.json(JSON.parse(cached))
  }

  const products = await Product.find({
    name: { $regex: keyword, $options: 'i' }
  })

  await setCache(cacheKey, JSON.stringify(products), 120)

  return res.json(products)
})

app.get('/api/products', async (req, res) => {
  const { category, keyword } = req.query
  const normalizedCategory = category ? String(category).toLowerCase() : ''
  const normalizedKeyword = keyword ? String(keyword).toLowerCase() : ''
  const cacheKey = `product:list:${normalizedCategory}:${normalizedKeyword}`

  const cached = await getCache(cacheKey)
  if (cached) {
    return res.json(JSON.parse(cached))
  }

  const filter = {}

  if (category) {
    filter.category = category
  }

  if (keyword) {
    filter.name = { $regex: keyword, $options: 'i' }
  }

  const products = await Product.find(filter)
  await setCache(cacheKey, JSON.stringify(products), 120)
  return res.json(products)
})

app.get('/api/products/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const cacheKey = `product:detail:${req.params.id}`
  const cached = await getCache(cacheKey)
  if (cached) {
    return res.json(JSON.parse(cached))
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  await setCache(cacheKey, JSON.stringify(product), 180)

  return res.json(product)
})

app.post('/api/products', requireAdmin, async (req, res) => {
  const defaultName = `Sample Product ${Date.now()}`
  const payload = {
    ...req.body,
    name: req.body.name || defaultName,
    description: req.body.description || 'Sample description',
    category: Array.isArray(req.body.category) ? req.body.category : [req.body.category || 'General'],
    sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
    price: typeof req.body.price === 'number' ? req.body.price : 0,
    countInStock: typeof req.body.countInStock === 'number' ? req.body.countInStock : 0,
    images: Array.isArray(req.body.images) ? req.body.images : []
  }

  const product = await Product.create(payload)
  await deleteCacheByPrefix('product:')
  return res.status(201).json(product)
})

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  product.name = req.body.name ?? product.name
  product.description = req.body.description ?? product.description
  product.category = Array.isArray(req.body.category)
    ? req.body.category
    : req.body.category
      ? [req.body.category]
      : product.category
  product.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : product.sizes
  product.price = typeof req.body.price === 'number' ? req.body.price : product.price
  product.countInStock = typeof req.body.countInStock === 'number' ? req.body.countInStock : product.countInStock
  product.images = Array.isArray(req.body.images) ? req.body.images : product.images

  const updatedProduct = await product.save()
  await deleteCacheByPrefix('product:')
  return res.json(updatedProduct)
})

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  await product.deleteOne()
  await deleteCacheByPrefix('product:')
  return res.json({ message: 'Product removed' })
})

app.post('/api/products/internal/stock-check', async (req, res) => {
  const { items } = req.body

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'items must be an array' })
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

  const allAvailable = checks.every((item) => item.available)
  return res.json({ allAvailable, checks })
})

app.post('/api/products/internal/decrement-stock', async (req, res) => {
  const { items } = req.body

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'items must be an array' })
  }

  await Promise.all(
    items.map(async (item) => {
      const product = await resolveProductFromItem(item)
      if (!product) {
        return
      }

      await Product.findByIdAndUpdate(product._id, { $inc: { countInStock: -item.qty } })
    })
  )

  await deleteCacheByPrefix('product:')

  return res.json({ message: 'Stock updated' })
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'product-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.PRODUCT_DB_URI, 'products')
  const port = Number(process.env.PRODUCT_SERVICE_PORT || process.env.PORT) || 5002
  app.listen(port, '0.0.0.0', () => console.log(`product-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
