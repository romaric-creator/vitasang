const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

let redisClient;
let storeGenerator = () => undefined; // Default memory store

if (process.env.NODE_ENV !== 'test') {
  const RedisStore = require('rate-limit-redis').default || require('rate-limit-redis');
  const { createClient } = require('redis');

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  redisClient.connect().catch(console.error);

  storeGenerator = (prefix) => new RedisStore({
    prefix: prefix,
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
}

// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: storeGenerator("rl:global:"),
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      message: 'Trop de requêtes. Veuillez réessayer plus tard.',
    });
  },
});

// Authentication endpoints rate limiter: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true, // Only count failed requests
  store: storeGenerator("rl:auth:"),
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      endpoint: req.path,
      method: req.method,
    });
    res.status(429).json({
      message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.',
    });
  },
});

// Registration rate limiter: 10 attempts per day
const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  message: 'Trop d\'inscriptions depuis cette adresse IP, veuillez réessayer demain.',
  store: storeGenerator("rl:register:"),
  handler: (req, res) => {
    logger.warn('Registration rate limit exceeded', {
      ip: req.ip,
    });
    res.status(429).json({
      message: 'Trop d\'inscriptions. Veuillez réessayer demain.',
    });
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
};
