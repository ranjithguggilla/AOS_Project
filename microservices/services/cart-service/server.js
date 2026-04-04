import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler } from '../../shared/metrics.js'
import cartRoutes from './routes/cartRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('cart-service'))
app.use('/api/cart', cartRoutes)

app.get('/health', (_req, res) => {
  res.json({
    service: 'cart-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.CART_DB_URI, 'CartDB')
  const port = Number(process.env.CART_SERVICE_PORT || process.env.PORT) || 5003
  app.listen(port, '0.0.0.0', () => console.log(`cart-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
