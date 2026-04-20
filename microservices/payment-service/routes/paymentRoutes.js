const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Payment = require('../models/Payment');
const IdempotencyRecord = require('../models/IdempotencyRecord');
const { protect } = require('../middleware/auth');
const { createCircuitBreaker, CircuitBreakerOpenError } = require('../utils/circuitBreaker');

const router = express.Router();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
const orderCircuitBreaker = createCircuitBreaker({
  name: 'order-service',
  failureThreshold: 4,
  resetTimeoutMs: 10000,
  halfOpenSuccesses: 2,
});

async function withRetry(fn, { attempts = 3, baseDelay = 500 } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

router.post('/process', protect, async (req, res) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey) {
      const existing = await IdempotencyRecord.findOne({ key: idempotencyKey });
      if (existing) {
        return res.status(existing.statusCode).json(JSON.parse(existing.responseJson));
      }
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const authHeader = req.headers.authorization;

    const { data: order } = await orderCircuitBreaker.execute(() =>
      withRetry(() =>
        axios.get(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
          timeout: 3000,
          headers: {
            Authorization: authHeader,
            'X-Request-Id': req.requestId,
          },
        })
      )
    );

    if (order.user !== req.user.id) {
      return res.status(403).json({ message: 'Order does not belong to this user' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    if (!['stripe_sandbox', 'paypal'].includes(order.paymentMethod || 'stripe_sandbox')) {
      return res.status(400).json({ message: 'Unsupported payment method' });
    }

    const isPaypal = (order.paymentMethod || 'stripe_sandbox') === 'paypal';
    const providerToken = (isPaypal ? 'pp_test_' : 'pi_test_') + crypto.randomBytes(12).toString('hex');
    const last4 = isPaypal ? null : '4242';

    const payment = await Payment.create({
      orderId,
      userId: req.user.id,
      amount: order.totalPrice,
      status: 'SUCCEEDED',
      providerToken,
      last4,
      method: order.paymentMethod || 'stripe_sandbox',
    });

    try {
      await orderCircuitBreaker.execute(() =>
        withRetry(() =>
          axios.put(
            `${ORDER_SERVICE_URL}/api/orders/${orderId}/pay`,
            {},
            {
              timeout: 3000,
              headers: {
                'X-Service-Token': SERVICE_TOKEN,
                'X-Request-Id': req.requestId,
              },
            }
          )
        )
      );
    } catch (markPaidErr) {
      payment.status = 'FAILED';
      await payment.save();

      try {
        await orderCircuitBreaker.execute(() =>
          withRetry(() =>
            axios.put(
              `${ORDER_SERVICE_URL}/api/orders/${orderId}/cancel`,
              {},
              {
                timeout: 3000,
                headers: {
                  'X-Service-Token': SERVICE_TOKEN,
                  'X-Request-Id': req.requestId,
                },
              }
            )
          )
        );
      } catch (_) {
        /* best-effort saga compensation */
      }

      return res.status(502).json({ message: 'Failed to mark order as paid', paymentId: payment._id });
    }

    if (idempotencyKey) {
      await IdempotencyRecord.create({
        key: idempotencyKey,
        statusCode: 201,
        responseJson: JSON.stringify(payment),
      });
    }

    return res.status(201).json(payment);
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      return res.status(503).json({ message: 'Order service temporarily unavailable (circuit open)' });
    }
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:orderId', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
