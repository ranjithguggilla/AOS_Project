import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler } from '../../shared/metrics.js'
import productRoutes from './routes/productRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('product-service'))
app.use('/api/products', productRoutes)

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
