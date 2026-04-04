import Payment from '../models/paymentModel.js'

const create = (payload) => Payment.create(payload)
const findByOrderId = (orderId) => Payment.findOne({ orderId })

export default { create, findByOrderId }
