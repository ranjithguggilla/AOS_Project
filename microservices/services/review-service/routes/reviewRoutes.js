import express from 'express'
import reviewController from '../controllers/reviewController.js'

const router = express.Router()

router.post('/', reviewController.createReview)
router.get('/:productId', reviewController.getReviews)

export default router
