import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler } from '../../shared/metrics.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('order-service'))
app.use('/api/orders', orderRoutes)

app.get('/health', (_req, res) => {
  res.json({
    service: 'order-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.ORDER_DB_URI, 'OrderDB')
  const port = Number(process.env.ORDER_SERVICE_PORT || process.env.PORT) || 5004
  app.listen(port, '0.0.0.0', () => console.log(`order-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
