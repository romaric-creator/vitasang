const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const isRedisConfigured = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;
  return redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://');
};

let redisClient = null;

if (process.env.NODE_ENV !== 'test') {
  const { createClient } = require('redis');

  if (isRedisConfigured()) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
        connectTimeout: 10000,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', { message: err.message });
    });

    redisClient.connect().catch((err) => {
      logger.error('Could not connect to Redis, using memory fallback', { message: err.message });
    });
  } else {
    logger.warn('Redis non configuré ou invalide, utilisation du cache mémoire pour le rate limiting');
  }
}

/**
 * Store custom qui utilise directement INCR / EXPIRE de Redis
 * Compatible avec redis v4 + Upstash (pas de EVAL)
 */
function makeStore(prefix, windowMs) {
  // Fallback mémoire si Redis absent
  const memoryStore = new Map();

  return {
    async increment(key) {
      const fullKey = `${prefix}${key}`;
      const windowSec = Math.ceil(windowMs / 1000);

      if (redisClient && redisClient.isOpen) {
        try {
          const hits = await redisClient.incr(fullKey);
          if (hits === 1) {
            await redisClient.expire(fullKey, windowSec);
          }
          const ttl = await redisClient.ttl(fullKey);
          return {
            totalHits: hits,
            resetTime: new Date(Date.now() + ttl * 1000),
          };
        } catch (e) {
          logger.error('Redis increment error, using memory fallback', { message: e.message });
        }
      }

      // Fallback mémoire
      const now = Date.now();
      const entry = memoryStore.get(fullKey);
      if (!entry || now > entry.resetTime) {
        memoryStore.set(fullKey, { totalHits: 1, resetTime: now + windowMs });
        return { totalHits: 1, resetTime: new Date(now + windowMs) };
      }
      entry.totalHits++;
      return { totalHits: entry.totalHits, resetTime: new Date(entry.resetTime) };
    },

    async decrement(key) {
      const fullKey = `${prefix}${key}`;
      if (redisClient && redisClient.isOpen) {
        try {
          await redisClient.decr(fullKey);
        } catch (e) { }
      }
    },

    async resetKey(key) {
      const fullKey = `${prefix}${key}`;
      if (redisClient && redisClient.isOpen) {
        try {
          await redisClient.del(fullKey);
        } catch (e) { }
      }
      memoryStore.delete(fullKey);
    },
  };
}

// Global rate limiter: 500 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 500,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:global:', 15 * 60 * 1000),
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      message: 'Trop de requêtes. Veuillez réessayer plus tard.',
    });
  },
});

// Auth rate limiter: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 5,
  skip: () => process.env.NODE_ENV === 'test',
  skipSuccessfulRequests: true,
  store: makeStore('rl:auth:', 15 * 60 * 1000),
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { ip: req.ip, endpoint: req.path });
    res.status(429).json({
      message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.',
    });
  },
});

// Register rate limiter: 10 attempts per day
const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 10,
  skip: () => process.env.NODE_ENV === 'test',
  store: makeStore('rl:register:', 24 * 60 * 60 * 1000),
  handler: (req, res) => {
    logger.warn('Registration rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      message: "Trop d'inscriptions. Veuillez réessayer demain.",
    });
  },
});

// Alert rate limiter: 10 alerts per hour (to avoid SMS/Notif spam)
// Désactivé en développement pour permettre les tests
const alertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 10,
  skip: () => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
  store: makeStore('rl:alert:', 60 * 60 * 1000),
  handler: (req, res) => {
    logger.warn('Alert rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      message: "Trop d'alertes envoyées. Veuillez patienter 1 heure avant de recommencer.",
    });
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  alertLimiter,
};
