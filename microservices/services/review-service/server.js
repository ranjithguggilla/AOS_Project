import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler } from '../../shared/metrics.js'
import reviewRoutes from './routes/reviewRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('review-service'))
app.use('/api/reviews', reviewRoutes)

app.get('/health', (_req, res) => {
  res.json({
    service: 'review-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.REVIEW_DB_URI, 'ReviewDB')
  const port = Number(process.env.REVIEW_SERVICE_PORT || process.env.PORT) || 5006
  app.listen(port, '0.0.0.0', () => console.log(`review-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
