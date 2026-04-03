const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { protect, serviceAuth } = require('../../middleware/auth');

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test('protect attaches user when bearer token is valid', async () => {
  process.env.JWT_SECRET = 'payment-test-secret';
  const token = jwt.sign(
    { id: 'pay-user', email: 'pay@example.com', isAdmin: false, name: 'Pay User' },
    process.env.JWT_SECRET
  );
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  let called = false;
  await protect(req, res, () => {
    called = true;
  });
  assert.equal(called, true);
  assert.equal(req.user.id, 'pay-user');
});

test('serviceAuth rejects invalid token', () => {
  process.env.SERVICE_TOKEN = 'expected-token';
  const req = { headers: { 'x-service-token': 'wrong-token' } };
  const res = createRes();
  serviceAuth(req, res, () => {});
  assert.equal(res.statusCode, 403);
});
