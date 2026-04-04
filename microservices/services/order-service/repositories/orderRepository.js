import Order from '../models/orderModel.js'

const create = (payload) => Order.create(payload)
const findByUserId = (userId) => Order.find({ userId }).sort({ createdAt: -1 })
const findById = (id) => Order.findById(id)

export default { create, findByUserId, findById }
