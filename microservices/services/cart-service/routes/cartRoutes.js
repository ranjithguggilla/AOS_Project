import express from 'express'
import cartController from '../controllers/cartController.js'

const router = express.Router()

router.post('/add', cartController.addItem)
router.delete('/remove', cartController.removeItem)
router.delete('/clear', cartController.clearCart)
router.put('/update', cartController.updateItem)
router.get('/:userId', cartController.getCart)

export default router
