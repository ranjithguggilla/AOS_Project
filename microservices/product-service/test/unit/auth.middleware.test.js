const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { protect, admin, serviceAuth } = require('../../middleware/auth');

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

test('protect sets req.user when token is valid', async () => {
  process.env.JWT_SECRET = 'product-test-secret';
  const token = jwt.sign({ id: 'p1', email: 'p@example.com', isAdmin: true }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  let called = false;
  await protect(req, res, () => {
    called = true;
  });
  assert.equal(called, true);
  assert.equal(req.user.id, 'p1');
});

test('admin rejects non-admin user', () => {
  const req = { user: { isAdmin: false } };
  const res = createRes();
  admin(req, res, () => {});
  assert.equal(res.statusCode, 403);
});

test('serviceAuth validates service token', () => {
  process.env.SERVICE_TOKEN = 'service-secret';
  const req = { headers: { 'x-service-token': 'service-secret' } };
  const res = createRes();
  let called = false;
  serviceAuth(req, res, () => {
    called = true;
  });
  assert.equal(called, true);
});
