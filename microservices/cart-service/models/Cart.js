const mongoose = require('mongoose');

const bomEntrySchema = new mongoose.Schema(
  {
    name: String,
    sku: String,
    price: Number,
  },
  { _id: false }
);

const customizationSchema = new mongoose.Schema(
  {
    componentIds: [String],
    bom: [bomEntrySchema],
    basePrice: Number,
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema({
  cartLineId: { type: String },
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 },
  customization: customizationSchema,
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
