const Redis = require("ioredis");
const NodeCache = require("node-cache");
const logger = require("../config/logger");

const isRedisConfigured = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;
  // Vérifier que ce n'est pas une URL vide ou placeholder
  return redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://');
};

class CacheService {
  constructor() {
    this.useRedis = false;
    this.localCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

    if (isRedisConfigured() && process.env.NODE_ENV !== 'test') {
      try {
        const redisUrl = process.env.REDIS_URL;
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          retryStrategy: (times) => Math.min(times * 100, 3000),
          connectTimeout: 10000,
        });
        this.useRedis = true;
        this.redis.on("connect", () => logger.info("Redis Connected"));
        this.redis.on("error", (err) => {
          logger.error("Redis Error", { message: err.message });
          this.useRedis = false;
        });
      } catch (error) {
        logger.warn("Échec de connexion Redis, utilisation cache mémoire", { message: error.message });
      }
    } else {
      logger.info("Cache mémoire local activé");
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
