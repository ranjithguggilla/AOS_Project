import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'

dotenv.config()

const app = express()
app.use(express.json())

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
)

const Review = mongoose.model('Review', reviewSchema)

app.post('/api/reviews', async (req, res) => {
  const { productId, userId, userName, rating, comment } = req.body

  if (!productId || !userId || !userName || !rating || !comment) {
    return res.status(400).json({ message: 'productId, userId, userName, rating and comment are required' })
  }

  const existing = await Review.findOne({ productId, userId })
  if (existing) {
    return res.status(400).json({ message: 'User already reviewed this product' })
  }

  const review = await Review.create({ productId, userId, userName, rating, comment })
  return res.status(201).json(review)
})

app.get('/api/reviews/:productId', async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 })
  return res.json(reviews)
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'review-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

const start = async () => {
  await connectDB(process.env.REVIEW_DB_URI, 'ReviewDB')
  const port = Number(process.env.PORT) || 5006
  app.listen(port, '0.0.0.0', () => console.log(`review-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
