import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String },
        image: { type: String },
        price: { type: Number },
        qty: { type: Number, required: true, default: 1 }
      }
    ]
  },
  { timestamps: true }
)

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema)

export default Cart
