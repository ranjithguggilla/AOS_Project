const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: String,
    qty: Number,
    image: String,
    price: Number,
    product: String,
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    userName: String,
    userEmail: String,
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: { type: String, default: 'stripe_sandbox' },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    idempotencyKey: { type: String, sparse: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
