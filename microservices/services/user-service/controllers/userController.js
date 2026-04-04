import userService from '../services/userService.js'
import { usersRegisteredTotal, usersLoggedInTotal } from '../../../shared/metrics.js'

const withErrorHandling = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' })
  }
}

const register = withErrorHandling(async (req, res) => {
  const authResponse = await userService.register(req.body)
  usersRegisteredTotal.inc()
  res.status(201).json(authResponse)
})

const login = withErrorHandling(async (req, res) => {
  const authResponse = await userService.login(req.body)
  usersLoggedInTotal.inc()
  res.json(authResponse)
})

const getProfile = withErrorHandling(async (req, res) => {
  res.json(userService.getProfile(req.user))
})

const updateProfile = withErrorHandling(async (req, res) => {
  const result = await userService.updateProfile(req.user, req.body)
  res.json(result)
})

const listUsers = withErrorHandling(async (_req, res) => {
  const users = await userService.listUsers()
  res.json(users)
})

const getUserById = withErrorHandling(async (req, res) => {
  const user = await userService.getUserById(req.params.id)
  res.json(user)
})

const updateUser = withErrorHandling(async (req, res) => {
  const result = await userService.updateUser(req.params.id, req.body)
  res.json(result)
})

const deleteUser = withErrorHandling(async (req, res) => {
  await userService.deleteUser(req.params.id)
  res.json({ message: 'User removed' })
})

export default { register, login, getProfile, updateProfile, listUsers, getUserById, updateUser, deleteUser }
