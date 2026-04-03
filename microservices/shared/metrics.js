import client from 'prom-client'

const registry = new client.Registry()

// Default Node.js process metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ register: registry })

// ── HTTP request counter ──────────────────────────────────────────────────────
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['service', 'method', 'route', 'status_code'],
  registers: [registry]
})

// ── HTTP request duration histogram ──────────────────────────────────────────
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry]
})

// ── Business counters ─────────────────────────────────────────────────────────
export const ordersTotal = new client.Counter({
  name: 'orders_total',
  help: 'Total number of orders created',
  registers: [registry]
})

export const usersRegisteredTotal = new client.Counter({
  name: 'users_registered_total',
  help: 'Total number of users registered',
  registers: [registry]
})

export const usersLoggedInTotal = new client.Counter({
  name: 'users_logged_in_total',
  help: 'Total number of user logins',
  registers: [registry]
})

export const paymentsTotal = new client.Counter({
  name: 'payments_total',
  help: 'Total number of payments processed',
  labelNames: ['status'],
  registers: [registry]
})

export const cartAdditionsTotal = new client.Counter({
  name: 'cart_additions_total',
  help: 'Total number of add-to-cart actions',
  registers: [registry]
})

export const reviewsTotal = new client.Counter({
  name: 'reviews_total',
  help: 'Total number of reviews submitted',
  registers: [registry]
})

export const productsViewedTotal = new client.Counter({
  name: 'products_viewed_total',
  help: 'Total number of product views',
  registers: [registry]
})

// ── Middleware factory ────────────────────────────────────────────────────────
/**
 * Express middleware that tracks HTTP request count and duration per service.
 * Usage: app.use(metricsMiddleware('my-service'))
 */
export function metricsMiddleware(serviceName) {
  return (req, res, next) => {
    if (req.path === '/metrics') return next()
    const start = Date.now()
    res.on('finish', () => {
      const route = req.route ? req.route.path : req.path
      const labels = {
        service: serviceName,
        method: req.method,
        route,
        status_code: res.statusCode
      }
      httpRequestsTotal.inc(labels)
      httpRequestDuration.observe(labels, (Date.now() - start) / 1000)
    })
    next()
  }
}

// ── /metrics endpoint handler ─────────────────────────────────────────────────
export async function metricsHandler(_req, res) {
  res.set('Content-Type', registry.contentType)
  res.end(await registry.metrics())
}
