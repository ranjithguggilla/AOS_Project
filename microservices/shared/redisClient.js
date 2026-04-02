import dotenv from 'dotenv'
import { createClient } from 'redis'

dotenv.config()

const redisUrl = process.env.REDIS_URL
let redisClient = null
let redisReady = false

if (redisUrl) {
  redisClient = createClient({ url: redisUrl })

  redisClient.on('ready', () => {
    redisReady = true
  })

  redisClient.on('end', () => {
    redisReady = false
  })

  redisClient.on('error', () => {
    redisReady = false
  })

  redisClient.connect().catch(() => {
    redisReady = false
  })
}

export const getCache = async (key) => {
  if (!redisClient || !redisReady) {
    return null
  }

  try {
    return await redisClient.get(key)
  } catch (_error) {
    return null
  }
}

export const setCache = async (key, value, ttlSeconds = 60) => {
  if (!redisClient || !redisReady) {
    return
  }

  try {
    await redisClient.setEx(key, ttlSeconds, value)
  } catch (_error) {
  }
}

export const deleteCache = async (key) => {
  if (!redisClient || !redisReady) {
    return
  }

  try {
    await redisClient.del(key)
  } catch (_error) {
  }
}

export const deleteCacheByPrefix = async (prefix) => {
  if (!redisClient || !redisReady) {
    return
  }

  try {
    const keys = []
    for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
      keys.push(key)
    }

    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  } catch (_error) {
  }
}

export const isCacheReady = () => Boolean(redisClient && redisReady)
