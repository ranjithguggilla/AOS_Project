import express from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import connectDB from '../../shared/connectDB.js'
import { metricsMiddleware, metricsHandler, usersRegisteredTotal, usersLoggedInTotal } from '../../shared/metrics.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(metricsMiddleware('user-service'))

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

const generateToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET || 'abc123', { expiresIn: '30d' })
}

const resolveUserFromAuthorization = async (authorization) => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abc123')
    if (!decoded?.id) {
      return null
    }

    return await User.findById(decoded.id)
  } catch (_error) {
    return null
  }
}

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id, user.isAdmin)
})

const requireAuth = async (req, res, next) => {
  const user = await resolveUserFromAuthorization(req.headers.authorization)
  if (!user) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  req.user = user
  next()
}

const requireAdmin = async (req, res, next) => {
  const user = await resolveUserFromAuthorization(req.headers.authorization)
  if (!user) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  if (!user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' })
  }

  req.user = user
  next()
}

app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashedPassword })
  usersRegisteredTotal.inc()

  return res.status(201).json(buildAuthResponse(user))
})

app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashedPassword })
  usersRegisteredTotal.inc()

  return res.status(201).json(buildAuthResponse(user))
})

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  usersLoggedInTotal.inc()

  return res.json(buildAuthResponse(user))
})

app.get('/api/users', requireAdmin, async (_req, res) => {
  const users = await User.find({}).select('-password')
  return res.json(users)
})

app.get('/api/users/profile', requireAuth, async (req, res) => {
  const { user } = req

  return res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  })
})

app.put('/api/users/profile', requireAuth, async (req, res) => {
  const { user } = req

  user.name = req.body.name || user.name
  user.email = req.body.email || user.email

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10)
  }

  const updatedUser = await user.save()
  return res.json(buildAuthResponse(updatedUser))
})

app.get('/api/users/:id', requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'User not found' })
  }

  const user = await User.findById(req.params.id).select('-password')
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.json(user)
})

app.put('/api/users/:id', requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'User not found' })
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  user.name = req.body.name || user.name
  user.email = req.body.email || user.email
  if (typeof req.body.isAdmin === 'boolean') {
    user.isAdmin = req.body.isAdmin
  }
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10)
  }

  const updatedUser = await user.save()
  return res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin
  })
})

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'User not found' })
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  await user.deleteOne()
  return res.json({ message: 'User removed' })
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'user-service',
    status: 'ok',
    db: mongoose.connection?.name || null
  })
})

app.get('/metrics', metricsHandler)

const start = async () => {
  await connectDB(process.env.USER_DB_URI, 'UserDB')
  const port = Number(process.env.USER_SERVICE_PORT || process.env.PORT) || 5001
  app.listen(port, '0.0.0.0', () => console.log(`user-service running on ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
