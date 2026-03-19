const NodeCache = require("node-cache");

// Initialize cache
// stdTTL: Default time to live in seconds
// checkperiod: Period in seconds for checking and deleting expired keys
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

/**
 * Express middleware to cache responses
 * @param {number} duration - Time to live in seconds
 */
const cacheMiddleware = (duration) => (req, res, next) => {
    if (req.method !== "GET") {
        console.error("Cannot cache non-GET methods!");
        return next();
    }

    // Custom key combining the original URL and query string
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Cache-Hit] ${key}`);
        }
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedResponse);
    }

    // Override res.json to intercept and cache the response
    const originalJson = res.json;
    res.json = (body) => {
        cache.set(key, body, duration);
        res.setHeader("X-Cache", "MISS");
        originalJson.call(res, body);
    };

    next();
};

module.exports = { cache, cacheMiddleware };
