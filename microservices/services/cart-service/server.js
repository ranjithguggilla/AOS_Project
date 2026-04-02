import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { getCache, setCache, deleteCache } from '../../shared/redisClient.js'

dotenv.config()

const app = express()
app.use(express.json())

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String },
        image: { type: String },
        price: { type: Number },
        qty: { type: Number, required: true, default: 1 }
      }
    ]
  },
  { timestamps: true }
)

const Cart = mongoose.model('Cart', cartSchema)

const getCartCacheKey = (userId) => `cart:user:${userId}`

app.post('/api/cart/add', async (req, res) => {
  const { userId, item } = req.body

  if (!userId || !item?.productId) {
    return res.status(400).json({ message: 'userId and item.productId are required' })
  }

  const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }))

  const existingItemIndex = cart.items.findIndex((entry) => entry.productId === item.productId)
  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].qty += item.qty || 1
  } else {
    cart.items.push({ ...item, qty: item.qty || 1 })
  }

  await cart.save()
  await deleteCache(getCartCacheKey(userId))
  return res.status(201).json(cart)
})

app.delete('/api/cart/remove', async (req, res) => {
  const { userId, productId } = req.body

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId and productId are required' })
  }

  const cart = await Cart.findOne({ userId })
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' })
  }

  cart.items = cart.items.filter((item) => item.productId !== productId)
  await cart.save()
  await deleteCache(getCartCacheKey(userId))
  return res.json(cart)
})

app.delete('/api/cart/clear', async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' })
  }

  const cart = await Cart.findOne({ userId })
  if (!cart) {
    return res.json({ userId, items: [] })
  }

  cart.items = []
  await cart.save()
  await deleteCache(getCartCacheKey(userId))
  return res.json(cart)
})

app.put('/api/cart/update', async (req, res) => {
  const { userId, productId, qty } = req.body

  if (!userId || !productId || typeof qty !== 'number') {
    return res.status(400).json({ message: 'userId, productId and qty are required' })
  }

  const cart = await Cart.findOne({ userId })
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' })
  }

  const item = cart.items.find((entry) => entry.productId === productId)
  if (!item) {
    return res.status(404).json({ message: 'Cart item not found' })
  }

  item.qty = qty
  await cart.save()
  await deleteCache(getCartCacheKey(userId))
  return res.json(cart)
})

app.get('/api/cart/:userId', async (req, res) => {
  const cacheKey = getCartCacheKey(req.params.userId)
  const cached = await getCache(cacheKey)
  if (cached) {
    return res.json(JSON.parse(cached))
  }

  const cart = await Cart.findOne({ userId: req.params.userId })
  const response = cart || { userId: req.params.userId, items: [] }
  await setCache(cacheKey, JSON.stringify(response), 90)

  return res.json(response)
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'cart-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

const start = async () => {
  await connectDB(process.env.CART_DB_URI, 'CartDB')
  const port = Number(process.env.PORT) || 5003
  app.listen(port, '0.0.0.0', () => console.log(`cart-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
