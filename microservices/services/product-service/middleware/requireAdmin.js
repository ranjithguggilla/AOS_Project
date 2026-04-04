import jwt from 'jsonwebtoken'

const requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  try {
    const token = authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abc123')
    if (!decoded?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }

    req.user = decoded
    next()
  } catch (_error) {
    return res.status(401).json({ message: 'Not authorized' })
  }
}

export default requireAdmin