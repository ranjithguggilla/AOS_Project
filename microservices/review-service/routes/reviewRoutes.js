
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const client = require('prom-client');
const reviewCreatedCounter = new client.Counter({
  name: 'review_created_total',
  help: 'Total number of reviews created',
});

router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, comment, userName } = req.body;

    const existing = await Review.findOne({ user: req.user.id, product });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user.id,
      userName: userName || req.user.email,
      product,
      rating,
      comment,
    });

    reviewCreatedCounter.inc();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Expose Prometheus metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
