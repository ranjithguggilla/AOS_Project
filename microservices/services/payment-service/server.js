import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler, paymentsTotal } from '../../shared/metrics.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('payment-service'))

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['paid', 'failed'], required: true }
  },
  { timestamps: true }
)

const Payment = mongoose.model('Payment', paymentSchema)

app.post('/api/payments/process', async (req, res) => {
  const { orderId, userId, amount, paymentMethod } = req.body

  if (!orderId || !userId || typeof amount !== 'number' || !paymentMethod) {
    return res.status(400).json({ message: 'orderId, userId, amount and paymentMethod are required' })
  }

  const status = amount >= 0 ? 'paid' : 'failed'
  const payment = await Payment.create({ orderId, userId, amount, paymentMethod, status })
  paymentsTotal.inc({ status })

  return res.status(status === 'paid' ? 200 : 402).json(payment)
})

app.get('/api/payments/:orderId', async (req, res) => {
  const payment = await Payment.findOne({ orderId: req.params.orderId })
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' })
  }

  return res.json(payment)
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'payment-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.PAYMENT_DB_URI, 'PaymentDB')
  const port = Number(process.env.PAYMENT_SERVICE_PORT || process.env.PORT) || 5005
  app.listen(port, '0.0.0.0', () => console.log(`payment-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
