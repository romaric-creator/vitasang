const Redis = require("ioredis");
const logger = require("../config/logger");

const isRedisConfigured = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;
  return redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://');
};

class CacheService {
  constructor() {
    this.redis = null;

    if (isRedisConfigured() && process.env.NODE_ENV !== 'test') {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          },
          connectTimeout: 5000,
          lazyConnect: true,
        });
        this.redis.on("connect", () => logger.info("Redis Cache Connected"));
        this.redis.on("error", (err) => {
          if (!this._errorLogged) {
            logger.warn("Redis Cache unavailable, cache disabled", { message: err.message });
            this._errorLogged = true;
          }
          this.redis = null;
        });
        this.redis.connect().catch(() => {
          logger.warn("Redis Cache connection failed, running without cache");
          this.redis = null;
        });
      } catch (error) {
        logger.warn("Redis cache init failed", { message: error.message });
      }
    } else {
      logger.info("Cache disabled (no Redis configured)");
    }
  }

  async get(key) {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  async del(key) {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  // Invalide toutes les clés matchant un préfixe (SCAN safe pour Upstash)
  async invalidatePattern(pattern) {
    if (!this.redis) return;
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      logger.error(`Cache SCAN/DEL error for pattern ${pattern}:`, error);
    }
  }

  // Get from cache or compute and store
  async getOrSet(key, fn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

module.exports = new CacheService();
