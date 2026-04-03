const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
