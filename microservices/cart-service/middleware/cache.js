const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

const cacheMiddleware = (keyFn) => async (req, res, next) => {
  try {
    const key = typeof keyFn === 'function' ? keyFn(req) : keyFn;
    const cached = await redis.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    res._cacheKey = key;
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.set(key, JSON.stringify(body), 'EX', 300).catch(() => {});
      return originalJson(body);
    };
    next();
  } catch {
    next();
  }
};

const invalidateCache = async (key) => {
  try {
    await redis.del(key);
  } catch {
    // silent fail
  }
};

module.exports = { redis, cacheMiddleware, invalidateCache };
