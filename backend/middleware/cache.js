const cacheService = require("../services/cache.service");
const logger = require("../config/logger");

/**
 * Express middleware to cache responses using the centralized cache service
 * @param {number} duration - Time to live in seconds
 */
const cacheMiddleware = (duration) => async (req, res, next) => {
  if (req.method !== "GET") {
    logger.warn(`Cannot cache non-GET methods: ${req.method} ${req.originalUrl}`);
    return next();
  }

  // Custom key combining the original URL and query string
  // Add a prefix to avoid collisions with other cache types
  const key = `api-cache:${req.originalUrl}`;
  
  try {
    const cachedResponse = await cacheService.get(key);

    if (cachedResponse) {
      if (process.env.NODE_ENV !== "production") {
        logger.debug(`[Cache-Hit] ${key}`);
      }
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cachedResponse);
    }

    // Override res.json to intercept and cache the response
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cacheService.set(key, body, duration).catch(err => {
          logger.error(`Failed to set cache for ${key}:`, err);
        });
      }
      res.setHeader("X-Cache", "MISS");
      originalJson.call(res, body);
    };

    next();
  } catch (error) {
    logger.error(`Cache middleware error for ${key}:`, error);
    next();
  }
};

module.exports = { cacheMiddleware };
