import jwt from 'jsonwebtoken'
import userRepository from '../repositories/userRepository.js'

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  try {
    const token = authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abc123')
    if (!decoded?.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const user = await userRepository.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    req.user = user
    next()
  } catch (_error) {
    return res.status(401).json({ message: 'Not authorized' })
  }
}

export default requireAuth
