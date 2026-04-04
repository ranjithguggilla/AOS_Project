import orderService from '../services/orderService.js'
import { ordersTotal } from '../../../shared/metrics.js'

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (error) {
    const status = error.status || 500
    const body = { message: error.message || 'Internal Server Error' }
    if (error.details) body.details = error.details
    if (error.orderId) body.orderId = error.orderId
    res.status(status).json(body)
  }
}

const createOrder = withErrorHandling(async (req, res) => {
  const order = await orderService.createOrder(req.body)
  ordersTotal.inc()
  res.status(201).json(order)
})

const getOrders = withErrorHandling(async (req, res) => {
  const orders = await orderService.getOrders(req.params.userId)
  res.json(orders)
})

const updateStatus = withErrorHandling(async (req, res) => {
  const order = await orderService.updateStatus(req.body.orderId, req.body.status)
  res.json(order)
})

export default { createOrder, getOrders, updateStatus }
