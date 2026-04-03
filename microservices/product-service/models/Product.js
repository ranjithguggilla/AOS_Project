const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    image: { type: String, default: '/catalog/placeholder.svg' },
    category: { type: String, default: 'robotics' },
    difficulty: { type: String, default: 'Beginner' },
    countInStock: { type: Number, default: 0 },
    tags: [String],
    voltage_volts: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
