const logger = require("../config/logger");
const notificationProcessor = require("./notification.processor");

let notificationQueue = { 
  add: async (name, data) => {
    logger.warn(`[NotificationQueue] Job skipped: '${name}'. Redis not configured or connection failed.`, { 
      jobData: { ...data, contenu: data?.contenu ? data.contenu.substring(0, 20) + "..." : undefined } 
    });
  } 
};

const isRedisConfigured = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;
  return redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://');
};

const redisUrl = process.env.REDIS_URL;
let redisConnectionFailed = false;

// Utiliser Redis seulement si configuré correctement
if (isRedisConfigured() && process.env.NODE_ENV !== "test") {
  try {
    const { Queue, Worker } = require("bullmq");
    const IORedis = require("ioredis");

    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    let errorLogged = false;
    connection.on("error", (err) => {
      if (!errorLogged) {
        logger.warn("Redis Connection Error:", { message: err.message });
        errorLogged = true;
      }
      redisConnectionFailed = true;
    });

    connection.connect().catch((err) => {
      if (!errorLogged) {
        logger.warn("Redis non disponible pour la queue", { message: err.message });
        errorLogged = true;
      }
      redisConnectionFailed = true;
    });

    if (!redisConnectionFailed) {
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
    }
  } catch (err) {
    logger.warn("Redis non disponible, fallback mémoire");
  }
} else {
  logger.warn("Redis non configuré, notifications synchrones (sans queue)");
}

module.exports = { notificationQueue };
