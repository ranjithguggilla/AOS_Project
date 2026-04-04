import Cart from '../models/cartModel.js'

const findByUserId = (userId) => Cart.findOne({ userId })
const create = (payload) => Cart.create(payload)

export default { findByUserId, create }
