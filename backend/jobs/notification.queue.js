const logger = require("../config/logger");
const notificationProcessor = require("./notification.processor");

let notificationQueue = { add: async () => {} };

const isRedisConfigured = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;
  return redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://');
};

const redisUrl = process.env.REDIS_URL;

// Utiliser Redis seulement si configuré correctement
if (isRedisConfigured() && process.env.NODE_ENV !== "test") {
  const { Queue, Worker } = require("bullmq");
  const IORedis = require("ioredis");

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  connection.on("error", (err) => {
    logger.error("Redis Connection Error:", err.message);
  });

  notificationQueue = new Queue("notifications", {
    connection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 1000,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    },
  });

  const worker = new Worker("notifications", notificationProcessor, { 
    connection,
    concurrency: 5 
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed`, err);
  });

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed`);
  });
  
  logger.info("Notification queue initialized with Redis");
} else {
  logger.warn("Redis non configuré, notifications synchrones (sans queue)");
}

module.exports = { notificationQueue };
