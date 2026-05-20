const logger = require("../config/logger");
const notificationProcessor = require("./notification.processor");

let notificationQueue = {
  add: async (name, data) => {
    logger.warn(`[NotificationQueue] Job skipped: '${name}'. Redis not available.`, {
      jobData: { ...data, contenu: data?.contenu ? data.contenu.substring(0, 20) + "..." : undefined },
    });
  },
};

const isRedisConfigured = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;
  return redisUrl.startsWith("rediss://") || redisUrl.startsWith("redis://");
};

if (isRedisConfigured() && process.env.NODE_ENV !== "test") {
  const { Queue, Worker } = require("bullmq");
  const IORedis = require("ioredis");

  const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => (times > 3 ? null : 500),
    connectTimeout: 5000,
  });

  connection.once("ready", () => {
    try {
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
        concurrency: 5,
      });

      worker.on("failed", (job, err) => {
        logger.error(`Job ${job?.id} failed`, err);
      });

      worker.on("completed", (job) => {
        logger.info(`Job ${job?.id} completed`);
      });

      logger.info("Notification queue initialized with Redis");
    } catch (err) {
      logger.warn("BullMQ init failed", { message: err.message });
    }
  });

  connection.on("error", (err) => {
    logger.warn("Redis non disponible, fallback mémoire", { message: err.message });
  });
} else {
  logger.warn("Redis non configuré, notifications synchrones (sans queue)");
}

module.exports = { notificationQueue };
