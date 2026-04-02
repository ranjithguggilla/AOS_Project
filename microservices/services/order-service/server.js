import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import axios from 'axios'
import connectDB from '../../shared/connectDB.js'

dotenv.config()

const app = express()
app.use(express.json())

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['created', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'created'
    },
    paymentId: { type: String }
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)

const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:5002'
const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:5005'

app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalPrice } = req.body

    if (!userId || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return res.status(400).json({ message: 'userId, items and paymentMethod are required' })
    }

    const stockResponse = await axios.post(`${productServiceUrl}/api/products/internal/stock-check`, { items })
    if (!stockResponse.data.allAvailable) {
      return res.status(400).json({
        message: 'Out-of-stock error',
        details: stockResponse.data.checks.filter((entry) => !entry.available)
      })
    }

    const normalizedItems = items.map((item, index) => {
      const check = stockResponse.data.checks[index]
      return {
        ...item,
        productId: check?.resolvedProductId || item.productId
      }
    })

    const draftOrder = await Order.create({
      userId,
      items: normalizedItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'processing'
    })

    const paymentResponse = await axios.post(`${paymentServiceUrl}/api/payments/process`, {
      orderId: draftOrder._id.toString(),
      userId,
      amount: totalPrice,
      paymentMethod
    })

    if (paymentResponse.status >= 400 || paymentResponse.data.status !== 'paid') {
      draftOrder.status = 'cancelled'
      await draftOrder.save()
      return res.status(402).json({ message: 'Payment failed', orderId: draftOrder._id })
    }

    await axios.post(`${productServiceUrl}/api/products/internal/decrement-stock`, { items: normalizedItems })

    draftOrder.paymentId = paymentResponse.data._id
    draftOrder.status = 'paid'
    await draftOrder.save()

    return res.status(201).json(draftOrder)
  } catch (error) {
    return res.status(502).json({ message: 'Order service dependency failure', error: error.message })
  }
})

app.get('/api/orders/:userId', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 })
  return res.json(orders)
})

app.put('/api/orders/status', async (req, res) => {
  const { orderId, status } = req.body

  if (!orderId || !status) {
    return res.status(400).json({ message: 'orderId and status are required' })
  }

  const order = await Order.findById(orderId)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  order.status = status
  await order.save()

  return res.json(order)
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'order-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

const start = async () => {
  await connectDB(process.env.ORDER_DB_URI, 'OrderDB')
  const port = Number(process.env.PORT) || 5004
  app.listen(port, '0.0.0.0', () => console.log(`order-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
