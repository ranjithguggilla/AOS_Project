import axios from 'axios'
import orderRepository from '../repositories/orderRepository.js'

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const productServiceUrl = () => process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:5002'
const paymentServiceUrl = () => process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:5005'

const createOrder = async ({ userId, items, shippingAddress, paymentMethod, totalPrice }) => {
  if (!userId || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
    throw createHttpError(400, 'userId, items and paymentMethod are required')
  }

  let stockResponse
  try {
    stockResponse = await axios.post(
      `${productServiceUrl()}/api/products/internal/stock-check`,
      { items }
    )
  } catch (_error) {
    throw createHttpError(502, 'Order service dependency failure')
  }

  if (!stockResponse.data.allAvailable) {
    const error = createHttpError(400, 'Out-of-stock error')
    error.details = stockResponse.data.checks.filter((entry) => !entry.available)
    throw error
  }

  const normalizedItems = items.map((item, index) => {
    const check = stockResponse.data.checks[index]
    return { ...item, productId: check?.resolvedProductId || item.productId }
  })

  const draftOrder = await orderRepository.create({
    userId,
    items: normalizedItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    status: 'processing'
  })

  let paymentResponse
  try {
    paymentResponse = await axios.post(`${paymentServiceUrl()}/api/payments/process`, {
      orderId: draftOrder._id.toString(),
      userId,
      amount: totalPrice,
      paymentMethod
    })
  } catch (_error) {
    draftOrder.status = 'cancelled'
    await draftOrder.save()
    throw createHttpError(502, 'Order service dependency failure')
  }

  if (paymentResponse.status >= 400 || paymentResponse.data.status !== 'paid') {
    draftOrder.status = 'cancelled'
    await draftOrder.save()
    const error = createHttpError(402, 'Payment failed')
    error.orderId = draftOrder._id
    throw error
  }

  await axios
    .post(`${productServiceUrl()}/api/products/internal/decrement-stock`, { items: normalizedItems })
    .catch(() => {})

  draftOrder.paymentId = paymentResponse.data._id
  draftOrder.status = 'paid'
  await draftOrder.save()

  return draftOrder
}

const getOrders = (userId) => orderRepository.findByUserId(userId)

const updateStatus = async (orderId, status) => {
  if (!orderId || !status) {
    throw createHttpError(400, 'orderId and status are required')
  }

  const order = await orderRepository.findById(orderId)
  if (!order) {
    throw createHttpError(404, 'Order not found')
  }

  order.status = status
  await order.save()
  return order
}

export default { createOrder, getOrders, updateStatus }
