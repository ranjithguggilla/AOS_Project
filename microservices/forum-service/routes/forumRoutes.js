/**
 * @swagger
 * tags:
 *   name: Forum
 *   description: Forum post management
 */

const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const { protect } = require('../middleware/auth');
const client = require('prom-client');
const forumPostCreatedCounter = new client.Counter({
  name: 'forum_post_created_total',
  help: 'Total number of forum posts created',
});

/**
 * @swagger
 * /api/forum/posts:
 *   get:
 *     summary: Get all forum posts
 *     tags: [Forum]
 *     parameters:
 *       - in: query
 *         name: kit_slug
 *         schema:
 *           type: string
 *         description: Filter posts by kit slug
 *     responses:
 *       200:
 *         description: List of posts
 */
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

/**
 * @swagger
 * /api/forum/posts/{id}:
 *   get:
 *     summary: Get a forum post by ID
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post object
 *       404:
 *         description: Post not found
 */
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

/**
 * @swagger
 * /api/forum/posts:
 *   post:
 *     summary: Create a new forum post
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kitSlug:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       500:
 *         description: Server error
 */
router.post('/posts', protect, async (req, res) => {
  try {
    const { kitSlug, title, content } = req.body;
    const post = await ForumPost.create({
      kitSlug,
      title,
      content,
      authorEmail: req.user.email,
    });
    forumPostCreatedCounter.inc();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Expose Prometheus metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

/**
 * @swagger
 * /api/forum/posts/{id}:
 *   delete:
 *     summary: Delete a forum post by ID
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
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
