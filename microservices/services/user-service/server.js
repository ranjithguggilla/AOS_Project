import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler } from '../../shared/metrics.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('user-service'))
app.use('/api/users', userRoutes)

app.get('/health', (_req, res) => {
  res.json({
    service: 'user-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.USER_DB_URI, 'UserDB')
  const port = Number(process.env.USER_SERVICE_PORT || process.env.PORT) || 5001
  app.listen(port, '0.0.0.0', () => console.log(`user-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
