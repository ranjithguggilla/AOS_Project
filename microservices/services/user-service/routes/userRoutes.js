import express from 'express'
import userController from '../controllers/userController.js'
import requireAuth from '../middleware/requireAuth.js'
import requireAdmin from '../middleware/requireAdmin.js'

const router = express.Router()

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/', userController.register)

router.get('/profile', requireAuth, userController.getProfile)
router.put('/profile', requireAuth, userController.updateProfile)

router.get('/', requireAdmin, userController.listUsers)
router.get('/:id', requireAdmin, userController.getUserById)
router.put('/:id', requireAdmin, userController.updateUser)
router.delete('/:id', requireAdmin, userController.deleteUser)

export default router
