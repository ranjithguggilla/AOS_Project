const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SUCCEEDED', 'FAILED'],
      default: 'SUCCEEDED',
    },
    providerToken: String,
    last4: String,
    method: { type: String, default: 'stripe_sandbox' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
