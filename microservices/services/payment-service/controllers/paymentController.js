import paymentService from '../services/paymentService.js'
import { paymentsTotal } from '../../../shared/metrics.js'

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' })
  }
}

const processPayment = withErrorHandling(async (req, res) => {
  const { payment, status } = await paymentService.processPayment(req.body)
  paymentsTotal.inc({ status })
  res.status(status === 'paid' ? 200 : 402).json(payment)
})

const getPayment = withErrorHandling(async (req, res) => {
  const payment = await paymentService.getPayment(req.params.orderId)
  res.json(payment)
})

export default { processPayment, getPayment }
