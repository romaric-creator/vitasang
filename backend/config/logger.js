const winston = require('winston');
const path = require('path');
const fs = require('fs');

const isRender = process.env.RENDER === '1';
const logsDir = path.join(__dirname, '../logs');

// Créer le dossier logs s'il n'existe pas, sauf sur Render (read-only file system)
if (!isRender) {
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir);
    } catch (err) {
      console.warn('Could not create logs directory:', err.message);
    }
  }
}

const transports = [];

if (!isRender) {
  transports.push(
    // Log errors in error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log everything in combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  );
}

// Toujours logger dans la console
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp || new Date().toISOString()} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
      })
    ),
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vitasang-api' },
  transports: transports,
});

module.exports = logger;
