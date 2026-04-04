import User from '../models/userModel.js'

const findByEmail = (email) => User.findOne({ email })
const findById = (id) => User.findById(id)
const findAll = () => User.find({}).select('-password')
const findByIdSelected = (id) => User.findById(id).select('-password')
const create = (payload) => User.create(payload)

export default { findByEmail, findById, findAll, findByIdSelected, create }
