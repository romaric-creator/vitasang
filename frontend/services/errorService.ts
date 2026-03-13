/**
 * Frontend Error Handler Service
 * Centralized error handling for the application
 */

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Custom AppError class for frontend client
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error type mappings and user-friendly messages
 */
export const ErrorMessages: Record<string, string> = {
  // Authentication errors
  'UNAUTHORIZED': 'Veuillez vous reconnecter',
  'INVALID_TOKEN': 'Votre session a expiré',
  'INVALID_CREDENTIALS': 'Identifiants invalides',

  // Validation errors
  'VALIDATION_ERROR': 'Veuillez vérifier vos données',
  'BAD_REQUEST': 'Requête invalide',

  // Resource errors
  'NOT_FOUND': 'Ressource non trouvée',
  'RESOURCE_NOT_FOUND': 'La ressource que vous cherchez n\'existe plus',
  'ROUTE_NOT_FOUND': 'Cette page n\'existe pas',

  // Access errors
  'FORBIDDEN': 'Vous n\'avez pas le droit d\'accéder à cette ressource',
  'UNAUTHORIZED_ACCESS': 'Accès refusé',

  // Conflict errors
  'CONFLICT': 'Cette ressource existe déjà',

  // Rate limiting
  'RATE_LIMIT': 'Trop de requêtes, patientez quelques moments',
  'TOO_MANY_REQUESTS': 'Trop de requêtes, patientez quelques moments',

  // Network errors
  'TIMEOUT': 'La requête a dépassé le délai autorisé',
  'NETWORK_ERROR': 'Erreur de connexion, vérifiez votre internet',
  'ERR_BAD_REQUEST': 'Erreur de requête',

  // Server errors
  'INTERNAL_SERVER_ERROR': 'Erreur serveur, veuillez réessayer',
  'DATABASE_ERROR': 'Erreur base de données',
  'EXTERNAL_API_ERROR': 'Erreur service externe',
};

/**
 * Parse API error response
 */
export const parseApiError = (response: any): ApiError => {
  // Handle Axios error response
  if (response?.error) {
    return {
      code: response.error.code || 'UNKNOWN_ERROR',
      message: response.error.message || 'Une erreur est survenue',
      statusCode: response.error.statusCode || 500,
      details: response.error.details,
      timestamp: response.error.timestamp
    };
  }

  // Handle generic response
  if (response?.message) {
    return {
      code: 'UNKNOWN_ERROR',
      message: response.message,
      statusCode: response.statusCode || 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Une erreur est survenue',
    statusCode: 500,
  };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: ApiError | string): string => {
  if (typeof error === 'string') {
    return ErrorMessages[error] || error;
  }

  const customMessage = ErrorMessages[error.code];
  return customMessage || error.message || 'Une erreur est survenue';
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  const retryableCodes = ['TIMEOUT', 'RATE_LIMIT', 'NETWORK_ERROR'];

  return (
    retryableStatusCodes.includes(error.statusCode) ||
    retryableCodes.includes(error.code)
  );
};

/**
 * Check if error is authentication-related
 */
export const isAuthError = (error: ApiError): boolean => {
  return (
    error.statusCode === 401 ||
    error.code === 'UNAUTHORIZED' ||
    error.code === 'INVALID_TOKEN'
  );
};

/**
 * Check if error is validation-related
 */
export const isValidationError = (error: ApiError): boolean => {
  return (
    error.statusCode === 400 ||
    error.code === 'VALIDATION_ERROR' ||
    error.code === 'BAD_REQUEST'
  );
};
