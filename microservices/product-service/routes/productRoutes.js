const express = require('express');
const Product = require('../models/Product');
const Component = require('../models/Component');
const { protect, admin, serviceAuth } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache, redis } = require('../middleware/cache');

const router = express.Router();

router.get('/', cacheMiddleware('products'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', cacheMiddleware('search'), async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const products = await Product.find({
      name: { $regex: keyword, $options: 'i' },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/components', cacheMiddleware('components'), async (req, res) => {
  try {
    const components = await Component.find();
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/customize', async (req, res) => {
  try {
    const { kit_id, component_ids } = req.body;
    if (!Array.isArray(component_ids)) {
      return res.status(400).json({ message: 'component_ids must be an array' });
    }
    const uniqueIds = [...new Set(component_ids.map(String))];
    if (uniqueIds.length !== component_ids.length) {
      return res.status(400).json({ message: 'Duplicate component IDs are not allowed' });
    }

    const cacheKey = `customize:${kit_id}:${uniqueIds.slice().sort().join(',')}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json({ ...JSON.parse(cached), cache_hit: true });
    }

    const kit = await Product.findById(kit_id);
    if (!kit) return res.status(404).json({ message: 'Kit not found' });

    const components = await Component.find({ _id: { $in: uniqueIds } });
    if (components.length !== uniqueIds.length) {
      return res.status(400).json({ message: 'One or more components not found' });
    }

    const bom = [
      { name: kit.name, sku: kit.slug, price: kit.price },
      ...components.map((c) => ({ name: c.name, sku: c.sku, price: c.price })),
    ];

    const total = parseFloat(bom.reduce((sum, item) => sum + item.price, 0).toFixed(2));

    const warnings = [];
    const activeVoltages = new Set([kit.voltage_volts]);
    for (const c of components) {
      if (c.voltage_volts > 0) activeVoltages.add(c.voltage_volts);
    }
    if (activeVoltages.size > 1) {
      warnings.push(
        `Mixed voltages detected: ${[...activeVoltages].join('V, ')}V — you may need a voltage regulator`
      );
    }

    const result = {
      kit_id,
      kit_name: kit.name,
      total,
      difficulty: kit.difficulty,
      bom,
      warnings,
    };

    await redis.setex(cacheKey, 300, JSON.stringify(result)).catch(() => {});

    res.json({ ...result, cache_hit: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', cacheMiddleware('product'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await invalidateCache('products:*');
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await invalidateCache('products:*');
    await invalidateCache('product:*');
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await invalidateCache('products:*');
    await invalidateCache('product:*');
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/internal/stock-check', serviceAuth, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ inStock: product.countInStock >= qty, available: product.countInStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/internal/decrement-stock', serviceAuth, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { countInStock: -qty } },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await invalidateCache('products:*');
    await invalidateCache('product:*');
    res.json({ message: 'Stock decremented', countInStock: product.countInStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
