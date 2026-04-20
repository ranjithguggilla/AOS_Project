const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => console.error('Redis error:', err.message));

function cacheMiddleware(keyPrefix, ttl = 300) {
  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.originalUrl}`;
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch {
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.setex(key, ttl, JSON.stringify(body)).catch(() => {});
      return originalJson(body);
    };
    next();
  };
}

async function invalidateCache(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

module.exports = { redis, cacheMiddleware, invalidateCache };
