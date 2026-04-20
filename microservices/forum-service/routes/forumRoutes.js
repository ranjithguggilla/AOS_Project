const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const { protect } = require('../middleware/auth');

router.get('/posts', async (req, res) => {
  try {
    const filter = {};
    if (req.query.kit_slug) {
      filter.kitSlug = req.query.kit_slug;
    }
    const posts = await ForumPost.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts', protect, async (req, res) => {
  try {
    const { kitSlug, title, content } = req.body;
    const post = await ForumPost.create({
      kitSlug,
      title,
      content,
      authorEmail: req.user.email,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
