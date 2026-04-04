import Product from '../models/productModel.js'

const findByNameLike = (keyword) => {
  return Product.find({
    name: { $regex: keyword, $options: 'i' }
  })
}

const findByFilter = (filter) => Product.find(filter)

const findById = (id) => Product.findById(id)

const findByExactNameInsensitive = (name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return Product.findOne({
    name: { $regex: `^${escaped}$`, $options: 'i' }
  })
}

const create = (payload) => Product.create(payload)

const deleteOne = (product) => product.deleteOne()

const updateByIdIncStock = (id, qty) => {
  return Product.findByIdAndUpdate(id, { $inc: { countInStock: -qty } })
}

export default {
  findByNameLike,
  findByFilter,
  findById,
  findByExactNameInsensitive,
  create,
  deleteOne,
  updateByIdIncStock
}