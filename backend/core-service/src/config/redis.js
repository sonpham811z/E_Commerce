const { createClient } = require('redis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Limit reconnect delay to max 3 seconds
      const delay = Math.min(retries * 100, 3000);
      logger.warn(`Redis connection lost. Reconnecting in ${delay}ms... (attempt ${retries})`);
      return delay;
    }
  }
});

client.on('connect', () => logger.info('Connecting to Redis...'));
client.on('ready', () => logger.info('Redis client connected and ready'));
client.on('error', (err) => logger.error('Redis client error:', err));
client.on('end', () => logger.warn('Redis client connection closed'));

const connectRedis = async () => {
  try {
    await client.connect();
  } catch (err) {
    logger.error('Could not establish initial connection to Redis:', err);
    // Do not crash the app; let the app run without cache.
  }
};

/**
 * Safely get a value from cache.
 * Automatically parses JSON if it is a JSON string.
 */
const get = async (key) => {
  if (!client.isReady) return null;
  try {
    const data = await client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (err) {
    logger.error(`Redis GET error for key "${key}":`, err);
    return null;
  }
};

/**
 * Safely set a value in cache with expiration.
 * Automatically stringifies objects.
 */
const setEx = async (key, seconds, value) => {
  if (!client.isReady) return false;
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await client.setEx(key, seconds, stringValue);
    return true;
  } catch (err) {
    logger.error(`Redis SETEX error for key "${key}":`, err);
    return false;
  }
};

/**
 * Safely delete a key from cache.
 */
const del = async (key) => {
  if (!client.isReady) return false;
  try {
    await client.del(key);
    return true;
  } catch (err) {
    logger.error(`Redis DEL error for key "${key}":`, err);
    return false;
  }
};

/**
 * Safely increment a key.
 */
const incr = async (key) => {
  if (!client.isReady) return null;
  try {
    return await client.incr(key);
  } catch (err) {
    logger.error(`Redis INCR error for key "${key}":`, err);
    return null;
  }
};

/**
 * Safely delete all keys matching a glob pattern using scan iterator.
 */
const delPattern = async (pattern) => {
  if (!client.isReady) return false;
  try {
    const keys = [];
    for await (const key of client.scanIterator({
      MATCH: pattern,
      COUNT: 100
    })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      await client.del(keys);
      logger.debug(`Redis deleted ${keys.length} keys matching pattern: ${pattern}`);
    }
    return true;
  } catch (err) {
    logger.error(`Redis delPattern error for pattern "${pattern}":`, err);
    return false;
  }
};

module.exports = {
  client,
  connectRedis,
  get,
  setEx,
  del,
  incr,
  delPattern,
  isReady: () => client.isReady
};
