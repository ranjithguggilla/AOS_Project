import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['created', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'created'
    },
    paymentId: { type: String }
  },
  { timestamps: true }
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
