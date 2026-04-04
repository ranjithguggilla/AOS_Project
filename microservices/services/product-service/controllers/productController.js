import productService from '../services/productService.js'
import { productsViewedTotal } from '../../../shared/metrics.js'

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({
      message: error.message || 'Internal Server Error'
    })
  }
}

const searchProducts = withErrorHandling(async (req, res) => {
  const products = await productService.searchProducts(req.query.keyword || req.query.q || '')
  res.json(products)
})

const listProducts = withErrorHandling(async (req, res) => {
  const products = await productService.listProducts({
    category: req.query.category,
    keyword: req.query.keyword
  })
  res.json(products)
})

const getProductById = withErrorHandling(async (req, res) => {
  const product = await productService.getProductById(req.params.id)
  productsViewedTotal.inc()
  res.json(product)
})

const createProduct = withErrorHandling(async (req, res) => {
  const product = await productService.createProduct(req.body || {})
  res.status(201).json(product)
})

const updateProduct = withErrorHandling(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body || {})
  res.json(product)
})

const deleteProduct = withErrorHandling(async (req, res) => {
  await productService.deleteProduct(req.params.id)
  res.json({ message: 'Product removed' })
})

const checkStock = withErrorHandling(async (req, res) => {
  const result = await productService.checkStock(req.body?.items)
  res.json(result)
})

const decrementStock = withErrorHandling(async (req, res) => {
  await productService.decrementStock(req.body?.items)
  res.json({ message: 'Stock updated' })
})

export default {
  searchProducts,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  checkStock,
  decrementStock
}