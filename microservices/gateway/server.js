import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
app.use(express.json())

const serviceMap = {
  '/api/users': process.env.USER_SERVICE_URL || 'http://127.0.0.1:5001',
  '/api/products': process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:5002',
  '/api/cart': process.env.CART_SERVICE_URL || 'http://127.0.0.1:5003',
  '/api/orders': process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:5004',
  '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:5005',
  '/api/reviews': process.env.REVIEW_SERVICE_URL || 'http://127.0.0.1:5006'
}

const forwardRequest = (basePath, targetBaseUrl) => {
  return async (req, res) => {
    try {
      const targetUrl = `${targetBaseUrl}${req.originalUrl}`
      const headers = {}

      if (req.headers['content-type']) {
        headers['content-type'] = req.headers['content-type']
      }

      if (req.headers.authorization) {
        headers.authorization = req.headers.authorization
      }

      const response = await axios({
        url: targetUrl,
        method: req.method,
        headers,
        data: req.body,
        validateStatus: () => true
      })

      return res.status(response.status).json(response.data)
    } catch (error) {
      return res.status(502).json({
        message: `Gateway error for ${basePath}`,
        error: error.message
      })
    }
  }
}

Object.entries(serviceMap).forEach(([basePath, serviceUrl]) => {
  app.use(basePath, forwardRequest(basePath, serviceUrl))
})

app.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' })
})

const port = Number(process.env.PORT) || 9000
app.listen(port, '0.0.0.0', () => console.log(`api-gateway running on ${port}`))
