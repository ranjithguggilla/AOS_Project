import paymentRepository from '../repositories/paymentRepository.js'

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const processPayment = async ({ orderId, userId, amount, paymentMethod }) => {
  if (!orderId || !userId || typeof amount !== 'number' || !paymentMethod) {
    throw createHttpError(400, 'orderId, userId, amount and paymentMethod are required')
  }

  const status = amount >= 0 ? 'paid' : 'failed'
  const payment = await paymentRepository.create({ orderId, userId, amount, paymentMethod, status })
  return { payment, status }
}

const getPayment = async (orderId) => {
  const payment = await paymentRepository.findByOrderId(orderId)
  if (!payment) {
    throw createHttpError(404, 'Payment not found')
  }
  return payment
}

export default { processPayment, getPayment }
