const crypto = require('crypto');
const cacheService = require("../services/cache.service");
const logger = require("../config/logger");

/**
 * Express middleware to cache responses using the centralized cache service.
 * Supports ETag-based conditional requests (304 Not Modified) and Cache-Control headers.
 * Skips caching for personalized routes (profile/my-) when an Authorization header is present.
 * @param {number} duration - Time to live in seconds
 */
const cacheMiddleware = (duration) => async (req, res, next) => {
  if (req.method !== "GET") {
    logger.warn(`Cannot cache non-GET methods: ${req.method} ${req.originalUrl}`);
    return next();
  }

  // Skip cache for personalized data endpoints
  const isPersonalized = req.headers['authorization'] &&
    (/\/profile|\/my-/.test(req.originalUrl));
  if (isPersonalized) {
    return next();
  }

  const key = `api-cache:${req.originalUrl}`;

  try {
    const cached = await cacheService.get(key);

    if (cached) {
      if (process.env.NODE_ENV !== "production") {
        logger.debug(`[Cache-Hit] ${key}`);
      }

      // ETag check — return 304 if client already has a fresh copy
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && cached.etag && ifNoneMatch === cached.etag) {
        res.setHeader('ETag', cached.etag);
        res.setHeader('Cache-Control', `public, max-age=${duration}`);
        res.setHeader('X-Cache', 'HIT');
        return res.status(304).end();
      }

      res.setHeader('X-Cache', 'HIT');
      if (cached.etag) {
        res.setHeader('ETag', cached.etag);
        res.setHeader('Cache-Control', `public, max-age=${duration}`);
      }
      return res.status(200).json(cached.data);
    }

    // Override res.json to intercept and cache the response
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        const etag = '"' + crypto.createHash('md5').update(JSON.stringify(body)).digest('hex') + '"';
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', `public, max-age=${duration}`);
        cacheService.set(key, { data: body, etag }, duration).catch(err => {
          logger.error(`Failed to set cache for ${key}:`, err);
        });
      }
      res.setHeader('X-Cache', 'MISS');
      originalJson.call(res, body);
    };

    next();
  } catch (error) {
    logger.error(`Cache middleware error for ${key}:`, error);
    next();
  }
};

module.exports = { cacheMiddleware };
