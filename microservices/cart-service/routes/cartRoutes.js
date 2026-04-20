const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

router.get('/:userId', protect, cacheMiddleware((req) => `cart:${req.params.userId}`), async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this cart' });
    }
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { productId, name, image, price, qty } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += qty || 1;
    } else {
      cart.items.push({ productId, name, image, price, qty: qty || 1 });
    }

    await cart.save();
    await invalidateCache(`cart:${req.user.id}`);
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/update', protect, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.qty = qty;
    await cart.save();
    await invalidateCache(`cart:${req.user.id}`);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/remove', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    await invalidateCache(`cart:${req.user.id}`);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/clear/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to clear this cart' });
    }
    await Cart.findOneAndDelete({ userId: req.params.userId });
    await invalidateCache(`cart:${req.params.userId}`);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
