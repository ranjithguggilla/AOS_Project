import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';
const password = __ENV.TEST_PASSWORD || 'DIY@17strong';

export const options = {
  scenarios: {
    checkout: {
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 120,
      stages: [
        { target: 5, duration: '45s' },
        { target: 10, duration: '90s' },
        { target: 0, duration: '30s' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1200', 'p(99)<2000'],
  },
};

function jsonRequest(path, body, token, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return http.post(`${baseUrl}${path}`, JSON.stringify(body), { headers });
}

function loginOrRegister() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `k6.${suffix}@maker.local`;
  const name = `K6 User ${suffix}`;

  const regRes = jsonRequest('/api/users/register', { name, email, password });
  if (regRes.status !== 201 && regRes.status !== 400) {
    return null;
  }

  const loginRes = jsonRequest('/api/users/login', { email, password });
  if (loginRes.status !== 200) {
    return null;
  }
  return loginRes.json('token');
}

export default function () {
  const token = loginOrRegister();
  check(token, {
    'login token received': (t) => Boolean(t),
  });
  if (!token) {
    sleep(1);
    return;
  }

  const productsRes = http.get(`${baseUrl}/api/products`);
  check(productsRes, {
    'products available': (r) => r.status === 200 && Array.isArray(r.json()) && r.json().length > 0,
  });
  if (productsRes.status !== 200) {
    sleep(1);
    return;
  }

  const products = productsRes.json();
  const product = products[Math.floor(Math.random() * products.length)];

  const addCartRes = jsonRequest(
    '/api/cart/add',
    {
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
    },
    token
  );
  check(addCartRes, {
    'cart add success': (r) => r.status === 200,
  });

  const orderKey = `k6-order-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const orderRes = jsonRequest(
    '/api/orders',
    {
      orderItems: [
        {
          name: product.name,
          qty: 1,
          image: product.image,
          price: product.price,
          product: product._id,
        },
      ],
      shippingAddress: {
        address: '100 K6 Road',
        city: 'Load City',
        postalCode: '10000',
        country: 'US',
      },
      paymentMethod: 'stripe_sandbox',
    },
    token,
    { 'Idempotency-Key': orderKey }
  );
  check(orderRes, {
    'order creation success': (r) => r.status === 201,
  });
  if (orderRes.status !== 201) {
    sleep(1);
    return;
  }

  const paymentKey = `k6-pay-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const payRes = jsonRequest(
    '/api/payments/process',
    { orderId: orderRes.json('_id') },
    token,
    { 'Idempotency-Key': paymentKey }
  );
  check(payRes, {
    'payment success': (r) => r.status === 201,
  });

  sleep(0.5);
}
