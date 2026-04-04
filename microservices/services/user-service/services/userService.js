import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import userRepository from '../repositories/userRepository.js'
import generateToken from '../utils/generateToken.js'

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id, user.isAdmin)
})

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw createHttpError(400, 'name, email and password are required')
  }

  const existingUser = await userRepository.findByEmail(email)
  if (existingUser) {
    throw createHttpError(400, 'User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await userRepository.create({ name, email, password: hashedPassword })
  return buildAuthResponse(user)
}

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw createHttpError(401, 'Invalid credentials')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw createHttpError(401, 'Invalid credentials')
  }

  return buildAuthResponse(user)
}

const getProfile = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin
})

const updateProfile = async (user, body) => {
  user.name = body.name || user.name
  user.email = body.email || user.email
  if (body.password) {
    user.password = await bcrypt.hash(body.password, 10)
  }
  const updated = await user.save()
  return buildAuthResponse(updated)
}

const listUsers = () => userRepository.findAll()

const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(404, 'User not found')
  }
  const user = await userRepository.findByIdSelected(id)
  if (!user) {
    throw createHttpError(404, 'User not found')
  }
  return user
}

const updateUser = async (id, body) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(404, 'User not found')
  }
  const user = await userRepository.findById(id)
  if (!user) {
    throw createHttpError(404, 'User not found')
  }

  user.name = body.name || user.name
  user.email = body.email || user.email
  if (typeof body.isAdmin === 'boolean') {
    user.isAdmin = body.isAdmin
  }
  if (body.password) {
    user.password = await bcrypt.hash(body.password, 10)
  }

  const updated = await user.save()
  return { _id: updated._id, name: updated.name, email: updated.email, isAdmin: updated.isAdmin }
}

const deleteUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(404, 'User not found')
  }
  const user = await userRepository.findById(id)
  if (!user) {
    throw createHttpError(404, 'User not found')
  }
  await user.deleteOne()
}

export default { register, login, getProfile, updateProfile, listUsers, getUserById, updateUser, deleteUser }
