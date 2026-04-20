import test from 'node:test';
import assert from 'node:assert/strict';

const baseUrl = process.env.INTEGRATION_BASE_URL || 'http://localhost:8080';
const shouldRun = process.env.RUN_INTEGRATION === 'true';

async function request(path, { method = 'GET', token, body, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (body) finalHeaders['Content-Type'] = 'application/json';
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, body: json };
}

test('gateway checkout happy path: register -> login -> order -> payment', { skip: !shouldRun }, async () => {
  const suffix = Date.now();
  const email = `integration.${suffix}@maker.local`;
  const password = 'DIY@17strong';
  const name = 'Integration User';

  const registerRes = await request('/api/users/register', {
    method: 'POST',
    body: { name, email, password },
  });
  assert.equal(registerRes.status, 201);
  assert.ok(registerRes.body?.token);

  const loginRes = await request('/api/users/login', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(loginRes.status, 200);
  const token = loginRes.body?.token;
  assert.ok(token);

  const productsRes = await request('/api/products');
  assert.equal(productsRes.status, 200);
  assert.ok(Array.isArray(productsRes.body));
  assert.ok(productsRes.body.length > 0);
  const product = productsRes.body[0];

  const addCartRes = await request('/api/cart/add', {
    method: 'POST',
    token,
    body: {
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
    },
  });
  assert.equal(addCartRes.status, 200);

  const orderRes = await request('/api/orders', {
    method: 'POST',
    token,
    body: {
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
        address: '101 Integration Lane',
        city: 'Testville',
        postalCode: '12345',
        country: 'US',
      },
      paymentMethod: 'stripe_sandbox',
    },
    headers: { 'Idempotency-Key': `order-${suffix}` },
  });
  assert.equal(orderRes.status, 201);
  assert.ok(orderRes.body?._id);

  const paymentRes = await request('/api/payments/process', {
    method: 'POST',
    token,
    body: { orderId: orderRes.body._id },
    headers: { 'Idempotency-Key': `payment-${suffix}` },
  });
  assert.equal(paymentRes.status, 201);
  assert.equal(paymentRes.body?.status, 'SUCCEEDED');
});
