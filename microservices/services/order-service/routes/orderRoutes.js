import express from 'express'
import orderController from '../controllers/orderController.js'

const router = express.Router()

router.post('/', orderController.createOrder)
router.put('/status', orderController.updateStatus)
router.get('/:userId', orderController.getOrders)

export default router
