import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler } from '../../shared/metrics.js'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('payment-service'))
app.use('/api/payments', paymentRoutes)

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
