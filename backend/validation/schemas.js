const Joi = require('joi');

const schemas = {
  // Register user validation
  register: Joi.object({
    nom: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit avoir au moins 2 caractères',
    }),
    prenom: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Le prénom est requis',
      'string.min': 'Le prénom doit avoir au moins 2 caractères',
    }),
    telephone: Joi.string()
      .required()
      .pattern(/^(\+237[26]\d{8}|[26]\d{8})$/)
      .messages({
        'string.empty': 'Le numéro de téléphone est requis',
        'string.pattern.base': 'Format: +237 6XXXXXXXX ou 2XXXXXXXX (9 chiffres)',
      }),
    mot_de_passe: Joi.string().required().min(6).max(255).messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit avoir au moins 6 caractères',
    }),
    groupe_sanguin: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .required()
      .messages({
        'any.only': 'Le groupe sanguin doit être: A+, A-, B+, B-, AB+, AB-, O+, O-',
        'string.empty': 'Le groupe sanguin est requis',
      }),
    role: Joi.string()
      .valid('donneur', 'personnel', 'admin')
      .default('donneur')
      .messages({
        'any.only': 'Le rôle doit être: donneur, personnel ou admin',
      }),
    id_centre: Joi.number().integer().messages({
      'number.base': 'L\'id_centre doit être un nombre',
    }),
    email: Joi.string().email().max(150).allow(null).messages({
      'string.email': 'L\'email n\'est pas valide',
    }),
  }),

  // Login validation
  login: Joi.object({
    telephone: Joi.string()
      .required()
      .pattern(/^(\+237[26]\d{8}|[26]\d{8})$/)
      .messages({
        'string.empty': 'Le numéro de téléphone est requis',
        'string.pattern.base': 'Format: +237 6XXXXXXXX ou 2XXXXXXXX (9 chiffres)',
      }),
    mot_de_passe: Joi.string().required().min(6).messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit avoir au moins 6 caractères',
    }),
  }),

  // Create alert validation
  createAlert: Joi.object({
    latitude: Joi.number().required().messages({
      'number.base': 'La latitude doit être un nombre',
      'any.required': 'La latitude est requise',
    }),
    longitude: Joi.number().required().messages({
      'number.base': 'La longitude doit être un nombre',
      'any.required': 'La longitude est requise',
    }),
    groupe_sanguin: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .required()
      .messages({
        'any.only': 'Le groupe sanguin n\'est pas valide',
        'string.empty': 'Le groupe sanguin est requis',
      }),
    radius: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Le rayon doit être un nombre',
      'number.min': 'Le rayon doit être au minimum 1 km',
      'number.max': 'Le rayon doit être au maximum 100 km',
    }),
    urgence: Joi.string()
      .valid('NORMAL', 'URGENT', 'TRES_URGENT')
      .default('NORMAL')
      .messages({
        'any.only': 'Le degré d\'urgence doit être: NORMAL, URGENT ou TRES_URGENT',
      }),
    quantite_requise: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Le nombre de poches doit être un nombre',
      'number.min': 'Au minimum 1 poche requise',
    }),
    lieu: Joi.string().required().messages({
      'string.empty': 'Le lieu est requis',
    }),
    description: Joi.string().allow(''),
  }),

  // Update push token validation
  pushToken: Joi.object({
    pushToken: Joi.string().required().messages({
      'string.empty': 'Le pushToken est requis',
      'any.required': 'Le pushToken est requis',
    }),
  }),

  // Search users validation
  searchUsers: Joi.object({
    latitude: Joi.number().required().messages({
      'number.base': 'La latitude doit être un nombre',
    }),
    longitude: Joi.number().required().messages({
      'number.base': 'La longitude doit être un nombre',
    }),
    groupe_sanguin: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .required(),
    radius: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Update user profile
  updateUser: Joi.object({
    nom: Joi.string().min(2).max(100).allow('').messages({
      'string.min': 'Le nom doit avoir au moins 2 caractères',
    }),
    prenom: Joi.string().min(2).max(100).allow('').messages({
      'string.min': 'Le prénom doit avoir au moins 2 caractères',
    }),
    telephone: Joi.string()
      .pattern(/^(\+237[26]\d{8}|[26]\d{8})$/)
      .allow('')
      .messages({
        'string.pattern.base': 'Format: +237 6XXXXXXXX ou 2XXXXXXXX (9 chiffres)',
      }),
    groupe_sanguin: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .allow('')
      .messages({
        'any.only': 'Le groupe sanguin doit être: A+, A-, B+, B-, AB+, AB-, O+, O-',
      }),
    ville: Joi.string().max(100).allow(''),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
  }),

  // Create rendezvous
  createRendezvous: Joi.object({
    id_centre: Joi.number().integer().required().messages({
      'number.base': 'id_centre doit être un nombre',
      'any.required': 'id_centre est requis',
    }),
    date_rendezvous: Joi.date().required().iso().messages({
      'date.base': 'La date doit être au format ISO',
      'any.required': 'La date est requise',
    }),
    heure_debut: Joi.string().required().messages({
      'string.empty': 'L\'heure de début est requise',
    }),
  }),

  // Update alert status
  updateAlert: Joi.object({
    status: Joi.string()
      .valid('ACTIVE', 'COMPLETE', 'CANCELLED')
      .required()
      .messages({
        'any.only': 'Le statut doit être: ACTIVE, COMPLETE ou CANCELLED',
        'string.empty': 'Le statut est requis',
      }),
  }),
};

module.exports = schemas;
