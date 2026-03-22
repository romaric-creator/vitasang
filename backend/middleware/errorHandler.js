const logger = require("../config/logger");
const { AppError } = require("../utils/errorHandler");

/**
 * Global error handling middleware
 * Must be defined AFTER all other routes and middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Erreur serveur interne";
  err.code = err.code || "INTERNAL_SERVER_ERROR";

  // Log all errors
  const logLevel = err.statusCode >= 500 ? "error" : "warn";
  logger[logLevel]("Request error", {
    statusCode: err.statusCode,
    code: err.code,
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Handle Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    
    // Créer un message plus explicite pour l'utilisateur
    const fieldNames = errors.map(e => e.field).join(", ");
    
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Erreur de validation sur : ${fieldNames}`,
        statusCode: 400,
        details: errors,
      },
    });
  }

  // Handle Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = Object.keys(err.fields)[0] || "field";
    return res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: `Cette valeur ${field} existe déjà`,
        statusCode: 409,
        field,
      },
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Token invalide ou expiré",
        statusCode: 401,
      },
    });
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        timestamp: err.timestamp,
      },
    });
  }

  // Handle generic errors
  const isDevelopment = process.env.NODE_ENV === "development";
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      ...(isDevelopment && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found handler - Must be used AFTER all routes
 */
const notFoundHandler = (req, res, next) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
  });

  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} non trouvée`,
      statusCode: 404,
      path: req.originalUrl,
      method: req.method,
    },
  });
};

/**
 * Async route wrapper to catch promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
