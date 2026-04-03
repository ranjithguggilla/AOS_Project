const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.PRODUCT_SERVICE_BASE_URL;

test('product service health endpoint returns ok', { skip: !baseUrl }, async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});
