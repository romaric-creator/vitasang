const logger = require('../config/logger');

/**
 * Middleware de validation des données d'entrée
 * @param {Joi.Schema} schema - Le schéma Joi à valider
 * @returns {Function} Middleware Express
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    // Combiner body, query, et params
    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn('Validation error', {
        path: req.path,
        method: req.method,
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });

      const fieldErrors = {};
      error.details.forEach(detail => {
        const field = detail.path.join('.');
        fieldErrors[field] = detail.message;
      });

      return res.status(400).json({
        message: 'Erreur de validation',
        details: Object.values(fieldErrors)[0],
        errors: fieldErrors,
      });
    }

    // Remplacer req.body, req.query, req.params par les données validées et nettoyées
    req.body = value;
    next();
  };
};

module.exports = { validateRequest };
