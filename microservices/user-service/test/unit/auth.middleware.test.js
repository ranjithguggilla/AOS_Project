const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { protect, admin } = require('../../middleware/auth');

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

test('protect rejects missing bearer token', async () => {
  const req = { headers: {} };
  const res = createRes();
  let called = false;
  await protect(req, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
});

test('protect accepts valid bearer token', async () => {
  process.env.JWT_SECRET = 'unit-test-secret';
  const token = jwt.sign({ id: 'u1', email: 'u@example.com', isAdmin: true }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  let called = false;
  await protect(req, res, () => {
    called = true;
  });
  assert.equal(called, true);
  assert.equal(req.user.id, 'u1');
});

test('admin middleware rejects non-admin user', () => {
  const req = { user: { isAdmin: false } };
  const res = createRes();
  let called = false;
  admin(req, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
});
