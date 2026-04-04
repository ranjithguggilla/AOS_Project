import reviewService from '../services/reviewService.js'
import { reviewsTotal } from '../../../shared/metrics.js'

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' })
  }
}

const createReview = withErrorHandling(async (req, res) => {
  const review = await reviewService.createReview(req.body)
  reviewsTotal.inc()
  res.status(201).json(review)
})

const getReviews = withErrorHandling(async (req, res) => {
  const reviews = await reviewService.getReviews(req.params.productId)
  res.json(reviews)
})

export default { createReview, getReviews }
