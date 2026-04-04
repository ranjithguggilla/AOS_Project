import express from 'express'
import paymentController from '../controllers/paymentController.js'

const router = express.Router()

router.post('/process', paymentController.processPayment)
router.get('/:orderId', paymentController.getPayment)

export default router
