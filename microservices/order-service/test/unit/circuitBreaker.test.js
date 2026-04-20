const test = require('node:test');
const assert = require('node:assert/strict');
const { createCircuitBreaker, CircuitBreakerOpenError } = require('../../utils/circuitBreaker');

test('circuit breaker opens after threshold failures', async () => {
  const breaker = createCircuitBreaker({
    name: 'order-dependency',
    failureThreshold: 2,
    resetTimeoutMs: 200,
    halfOpenSuccesses: 1,
  });

  await assert.rejects(() => breaker.execute(async () => Promise.reject(new Error('fail-1'))));
  await assert.rejects(() => breaker.execute(async () => Promise.reject(new Error('fail-2'))));
  await assert.rejects(
    () => breaker.execute(async () => 'not-called'),
    (err) => err instanceof CircuitBreakerOpenError
  );
});

test('circuit breaker transitions back to closed after half-open success', async () => {
  const breaker = createCircuitBreaker({
    name: 'order-dependency',
    failureThreshold: 1,
    resetTimeoutMs: 50,
    halfOpenSuccesses: 1,
  });

  await assert.rejects(() => breaker.execute(async () => Promise.reject(new Error('boom'))));
  await new Promise((resolve) => setTimeout(resolve, 60));
  const result = await breaker.execute(async () => 'ok');
  assert.equal(result, 'ok');
});
