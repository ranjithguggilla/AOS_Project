require('./tracing');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { randomUUID } = require('crypto');
const client = require('prom-client');
const seed = require('./seed');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  registers: [register],
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const requestId = req.header('x-request-id') || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestDuration.observe(
      {
        service: 'product-service',
        method: req.method,
        route: req.route?.path || req.path,
        status_code: String(res.statusCode),
      },
      duration
    );
    console.log(
      JSON.stringify({
        service: 'product-service',
        level: 'info',
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
      })
    );
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service', requestId: req.requestId });
});

app.use('/api/products', require('./routes/productRoutes'));

const PORT = process.env.PORT || 8002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/product-service';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seed();
    app.listen(PORT, () => console.log(`product-service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
