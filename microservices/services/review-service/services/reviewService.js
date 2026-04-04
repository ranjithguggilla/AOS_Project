import reviewRepository from '../repositories/reviewRepository.js'

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const createReview = async ({ productId, userId, userName, rating, comment }) => {
  if (!productId || !userId || !userName || !rating || !comment) {
    throw createHttpError(400, 'productId, userId, userName, rating and comment are required')
  }

  const existing = await reviewRepository.findByProductIdAndUserId(productId, userId)
  if (existing) {
    throw createHttpError(400, 'User already reviewed this product')
  }

  return reviewRepository.create({ productId, userId, userName, rating, comment })
}

const getReviews = (productId) => reviewRepository.findByProductId(productId)

export default { createReview, getReviews }
