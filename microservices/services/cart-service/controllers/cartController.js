import cartService from '../services/cartService.js'
import { cartAdditionsTotal } from '../../../shared/metrics.js'

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' })
  }
}

const addItem = withErrorHandling(async (req, res) => {
  const cart = await cartService.addItem(req.body.userId, req.body.item)
  cartAdditionsTotal.inc()
  res.status(201).json(cart)
})

const removeItem = withErrorHandling(async (req, res) => {
  const cart = await cartService.removeItem(req.body.userId, req.body.productId)
  res.json(cart)
})

const clearCart = withErrorHandling(async (req, res) => {
  const cart = await cartService.clearCart(req.body.userId)
  res.json(cart)
})

const updateItem = withErrorHandling(async (req, res) => {
  const cart = await cartService.updateItem(req.body.userId, req.body.productId, req.body.qty)
  res.json(cart)
})

const getCart = withErrorHandling(async (req, res) => {
  const cart = await cartService.getCart(req.params.userId)
  res.json(cart)
})

export default { addItem, removeItem, clearCart, updateItem, getCart }
