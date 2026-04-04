import Review from '../models/reviewModel.js'

const findByProductIdAndUserId = (productId, userId) => Review.findOne({ productId, userId })
const create = (payload) => Review.create(payload)
const findByProductId = (productId) => Review.find({ productId }).sort({ createdAt: -1 })

export default { findByProductIdAndUserId, create, findByProductId }
