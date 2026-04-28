class CircuitBreakerOpenError extends Error {
  constructor(name) {
    super(`Circuit breaker is open for ${name}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

function createCircuitBreaker({
  name,
  failureThreshold = 5,
  resetTimeoutMs = 10000,
  halfOpenSuccesses = 2,
}) {
  let state = 'CLOSED';
  let failures = 0;
  let successesInHalfOpen = 0;
  let openedAt = 0;

  async function execute(fn) {
    const now = Date.now();
    if (state === 'OPEN') {
      if (now - openedAt >= resetTimeoutMs) {
        state = 'HALF_OPEN';
        successesInHalfOpen = 0;
      } else {
        throw new CircuitBreakerOpenError(name);
      }
    }

    try {
      const result = await fn();
      if (state === 'HALF_OPEN') {
        successesInHalfOpen += 1;
        if (successesInHalfOpen >= halfOpenSuccesses) {
          state = 'CLOSED';
          failures = 0;
          successesInHalfOpen = 0;
        }
      } else {
        failures = 0;
      }
      return result;
    } catch (err) {
      failures += 1;
      if (state === 'HALF_OPEN' || failures >= failureThreshold) {
        state = 'OPEN';
        openedAt = Date.now();
      }
      throw err;
    }
  }

  return { execute };
}

module.exports = {
  createCircuitBreaker,
  CircuitBreakerOpenError,
};

