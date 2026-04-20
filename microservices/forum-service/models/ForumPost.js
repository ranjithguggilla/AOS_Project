const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  kitSlug: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorEmail: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
