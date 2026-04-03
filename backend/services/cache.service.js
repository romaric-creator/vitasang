const Redis = require("ioredis");
const NodeCache = require("node-cache");
const logger = require("../config/logger");

class CacheService {
  constructor() {
    this.useRedis = false;
    this.localCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

    if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
      this.redis = new Redis(process.env.REDIS_URL);
      this.useRedis = true;
      this.redis.on("connect", () => logger.info("Redis Connected"));
      this.redis.on("error", (err) => {
        logger.error("Redis Error", err);
        this.useRedis = false; // Fallback to local cache on error
      });
    }
  }

  async get(key) {
    try {
      if (this.useRedis) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      }
      return this.localCache.get(key);
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      if (this.useRedis) {
        await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      } else {
        this.localCache.set(key, value, ttlSeconds);
      }
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  async del(key) {
    try {
      if (this.useRedis) {
        await this.redis.del(key);
      } else {
        this.localCache.del(key);
      }
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }
}

module.exports = new CacheService();
