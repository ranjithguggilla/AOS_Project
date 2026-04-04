import express from 'express'
import productController from '../controllers/productController.js'
import requireAdmin from '../middleware/requireAdmin.js'

const router = express.Router()

router.get('/search', productController.searchProducts)
router.get('/', productController.listProducts)
router.get('/:id', productController.getProductById)

router.post('/', requireAdmin, productController.createProduct)
router.put('/:id', requireAdmin, productController.updateProduct)
router.delete('/:id', requireAdmin, productController.deleteProduct)

router.post('/internal/check-stock', productController.checkStock)
router.post('/internal/stock-check', productController.checkStock)
router.post('/internal/decrement-stock', productController.decrementStock)

export default router