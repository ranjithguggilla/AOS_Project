const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const IdempotencyRecord = require('../models/IdempotencyRecord');
const { protect, admin, serviceAuth } = require('../middleware/auth');
const { createCircuitBreaker, CircuitBreakerOpenError } = require('../utils/circuitBreaker');

const router = express.Router();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

const productCircuitBreaker = createCircuitBreaker({
  name: 'product-service',
  failureThreshold: 4,
  resetTimeoutMs: 10000,
  halfOpenSuccesses: 2,
});

async function callProductService(req, endpoint, payload) {
  return productCircuitBreaker.execute(() =>
    axios.post(`${PRODUCT_SERVICE_URL}${endpoint}`, payload, {
      timeout: 3000,
      headers: {
        'X-Service-Token': SERVICE_TOKEN,
        'X-Request-Id': req.requestId,
      },
    })
  );
}

router.post('/', protect, async (req, res) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey) {
      const existing = await IdempotencyRecord.findOne({ key: idempotencyKey });
      if (existing) {
        return res.status(existing.statusCode).json(JSON.parse(existing.responseJson));
      }
    }

    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }

    const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxPrice = +(itemsTotal * 0.15).toFixed(2);
    const shippingPrice = itemsTotal > 100 ? 0 : 10;
    const totalPrice = +(itemsTotal + taxPrice + shippingPrice).toFixed(2);

    const stockResults = await Promise.all(
      orderItems.map((item) =>
        callProductService(req, '/api/products/internal/stock-check', {
          productId: item.product,
          qty: item.qty,
        }).then((r) => ({ item, inStock: r.data.inStock }))
      )
    );
    for (const { item, inStock } of stockResults) {
      if (!inStock) {
        return res.status(400).json({ message: `Product ${item.name} is out of stock` });
      }
    }

    await Promise.all(
      orderItems.map((item) =>
        callProductService(req, '/api/products/internal/decrement-stock', {
          productId: item.product,
          qty: item.qty,
        })
      )
    );

    const order = await Order.create({
      user: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'stripe_sandbox',
      taxPrice,
      shippingPrice,
      totalPrice,
      idempotencyKey: idempotencyKey || undefined,
    });

    if (idempotencyKey) {
      await IdempotencyRecord.create({
        key: idempotencyKey,
        statusCode: 201,
        responseJson: JSON.stringify(order),
      });
    }

    return res.status(201).json(order);
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      return res.status(503).json({ message: 'Product service temporarily unavailable (circuit open)' });
    }
    return res.status(500).json({ message: err.message });
  }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/pay', serviceAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order already marked as paid' });
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    const updated = await order.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order must be paid before delivery' });
    }
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Order already delivered' });
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updated = await order.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/cancel', serviceAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = false;
    order.paidAt = undefined;

    await Promise.all(
      order.orderItems.map((item) =>
        callProductService(req, '/api/products/internal/decrement-stock', {
          productId: item.product,
          qty: -item.qty,
        })
      )
    );

    const updated = await order.save();
    return res.json(updated);
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      return res.status(503).json({ message: 'Product service temporarily unavailable (circuit open)' });
    }
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
