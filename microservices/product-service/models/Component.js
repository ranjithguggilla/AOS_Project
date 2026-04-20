const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'module' },
  voltage_volts: { type: Number, default: 5 },
  image: { type: String, default: '/catalog/placeholder.svg' },
});

module.exports = mongoose.model('Component', componentSchema);
