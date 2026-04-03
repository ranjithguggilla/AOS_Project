const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userName: { type: String, required: true },
  product: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
