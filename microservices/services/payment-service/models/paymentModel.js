import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['paid', 'failed'], required: true }
  },
  { timestamps: true }
)

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

export default Payment
