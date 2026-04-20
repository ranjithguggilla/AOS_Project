const mongoose = require('mongoose');

const idempotencyRecordSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true, index: true },
  statusCode: { type: Number, default: 200 },
  responseJson: { type: String, default: '{}' },
});

module.exports = mongoose.model('IdempotencyRecord', idempotencyRecordSchema);
