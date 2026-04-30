const router = require('express').Router();
const promClient = require('prom-client');
const cartAddCounter = new promClient.Counter({
  name: 'cart_add_total',
  help: 'Total number of cart additions',
});
// Expose Prometheus metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

router.get('/:userId', cacheMiddleware((req) => `cart:${req.params.userId}`), async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { userId, productId, name, image, price, qty } = req.body;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += qty || 1;
    } else {
      cart.items.push({ productId, name, image, price, qty: qty || 1 });
    }

    await cart.save();
    cartAddCounter.inc();
    await invalidateCache(`cart:${userId}`);
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const { userId, productId, qty } = req.body;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.qty = qty;
    await cart.save();
    await invalidateCache(`cart:${userId}`);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    await invalidateCache(`cart:${userId}`);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/clear/:userId', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    await invalidateCache(`cart:${req.params.userId}`);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
