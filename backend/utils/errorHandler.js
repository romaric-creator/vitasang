/**
 * Custom AppError class for consistent error handling
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
      },
    };
  }
}

/**
 * Predefined error types
 */
const ErrorTypes = {
  // Client errors (4xx)
  BAD_REQUEST: (message = "Requête invalide") =>
    new AppError(message, 400, "BAD_REQUEST"),

  UNAUTHORIZED: (message = "Authentification requise") =>
    new AppError(message, 401, "UNAUTHORIZED"),

  FORBIDDEN: (message = "Accès refusé") =>
    new AppError(message, 403, "FORBIDDEN"),

  NOT_FOUND: (message = "Ressource non trouvée") =>
    new AppError(message, 404, "NOT_FOUND"),

  CONFLICT: (message = "Conflit de données") =>
    new AppError(message, 409, "CONFLICT"),

  VALIDATION_ERROR: (message = "Erreur de validation") =>
    new AppError(message, 400, "VALIDATION_ERROR"),

  RESOURCE_NOT_FOUND: (resourceName) =>
    new AppError(`${resourceName} introuvable`, 404, "RESOURCE_NOT_FOUND"),

  UNAUTHORIZED_ACCESS: (message = "Vous n'avez pas accès à cette ressource") =>
    new AppError(message, 403, "UNAUTHORIZED_ACCESS"),

  RATE_LIMIT: (message = "Trop de requêtes, veuillez réessayer plus tard") =>
    new AppError(message, 429, "RATE_LIMIT"),

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: (message = "Erreur serveur interne") =>
    new AppError(message, 500, "INTERNAL_SERVER_ERROR"),

  DATABASE_ERROR: (message = "Erreur base de données") =>
    new AppError(message, 500, "DATABASE_ERROR"),

  EXTERNAL_API_ERROR: (message = "Erreur service externe") =>
    new AppError(message, 503, "EXTERNAL_API_ERROR"),
};

module.exports = {
  AppError,
  ErrorTypes,
};
