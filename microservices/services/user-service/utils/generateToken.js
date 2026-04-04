import jwt from 'jsonwebtoken'

const generateToken = (id, isAdmin = false) =>
  jwt.sign({ id, isAdmin }, process.env.JWT_SECRET || 'abc123', { expiresIn: '30d' })

export default generateToken
