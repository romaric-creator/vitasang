const Joi = require("joi");

const schemas = {
  // Register user validation
  register: Joi.object({
    nom: Joi.string().required().min(2).max(100).messages({
      "string.empty": "Le nom est requis",
      "string.min": "Le nom doit avoir au moins 2 caractères",
    }),
    prenom: Joi.string().required().min(2).max(100).messages({
      "string.empty": "Le prénom est requis",
      "string.min": "Le prénom doit avoir au moins 2 caractères",
    }),
    telephone: Joi.string()
      .required()
      .pattern(/^6\d{8}$/)
      .messages({
        "string.empty": "Le numéro de téléphone est requis",
        "string.pattern.base":
          "Format valide: 6XXXXXXXX (9 chiffres commençant par 6)",
      }),
    mot_de_passe: Joi.string()
      .required()
      .min(8)
      .max(255)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        "string.empty": "Le mot de passe est requis",
        "string.min": "Le mot de passe doit avoir au moins 8 caractères",
        "string.pattern.base": "Le mot de passe doit contenir au moins une majuscule et un chiffre",
      }),
    groupe_sanguin: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .allow(null, "")
      .messages({
        "any.only":
          "Le groupe sanguin doit être: A+, A-, B+, B-, AB+, AB-, O+, O-",
      }),
    role: Joi.string()
      .valid("donneur", "personnel", "admin")
      .default("donneur")
      .messages({
        "any.only": "Le rôle doit être: donneur, personnel ou admin",
      }),
    id_centre: Joi.number().integer().allow(null).messages({
      "number.base": "L'id_centre doit être un nombre",
    }),
    email: Joi.string().email().max(150).allow(null, "").messages({
      "string.email": "L'email n'est pas valide",
    }),
  }),

  // Login validation
  login: Joi.object({
    telephone: Joi.string()
      .required()
      .pattern(/^6[5-9]\d{7}$/)
      .messages({
        "string.empty": "Le numéro de téléphone est requis",
        "string.pattern.base":
          "Format invalide. Utilisez 6XXXXXXXX (9 chiffres commençant par 6)",
      }),
    mot_de_passe: Joi.string().required().min(8).messages({
      "string.empty": "Le mot de passe est requis",
      "string.min": "Le mot de passe doit avoir au moins 8 caractères",
    }),
  }),

  // Create alert validation
  createAlert: Joi.object({
    latitude: Joi.number().required().min(-90).max(90).messages({
      "number.base": "La latitude doit être un nombre",
      "any.required": "La latitude est requise",
    }),
    longitude: Joi.number().required().min(-180).max(180).messages({
      "number.base": "La longitude doit être un nombre",
      "any.required": "La longitude est requise",
    }),
    groupe_sanguin: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .required()
      .messages({
        "any.only": "Le groupe sanguin n'est pas valide",
      }),
    radius: Joi.number().integer().min(1).max(100).default(10),
    urgence: Joi.string()
      .valid("NORMAL", "URGENT", "TRES_URGENT")
      .default("NORMAL"),
    quantite_requise: Joi.number().integer().min(1).default(1),
    lieu: Joi.string().required().messages({
      "string.empty": "Le lieu est requis",
    }),
    description: Joi.string().allow(""),
    nom_patient: Joi.string().max(100).allow(""),
    telephone_contact: Joi.string().max(20).allow(""),
  }),

  // Update push token validation
  pushToken: Joi.object({
    pushToken: Joi.string().required().messages({
      "string.empty": "Le pushToken est requis",
    }),
  }),

  // Search users validation
  searchUsers: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    groupe_sanguin: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .required(),
    radius: Joi.number().integer().min(1).max(500).default(10),
  }),

  // Search nearby centres
  searchCentres: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    radius: Joi.number().integer().min(1).max(100).default(50),
  }),

  // Update user profile
  updateUser: Joi.object({
    nom: Joi.string().min(2).max(100).allow(""),
    prenom: Joi.string().min(2).max(100).allow(""),
    telephone: Joi.string()
      .pattern(/^6[5-9]\d{7}$/)
      .allow(""),
    groupe_sanguin: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .allow(""),
    ville: Joi.string().max(100).allow(""),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
  }),

  // Create rendezvous
  createRendezvous: Joi.object({
    id_centre: Joi.number().integer().required(),
    date_rdv: Joi.date().required().iso(),
    heure_debut: Joi.string().required(),
  }),

  // Update alert status and details
  updateAlert: Joi.object({
    statut: Joi.string().valid("en_attente_validation", "en_cours", "resolu", "annule"),
    urgence: Joi.string().valid("NORMAL", "URGENT", "TRES_URGENT"),
    quantite_requise: Joi.number().integer().min(1),
    description: Joi.string().allow(""),
  }),

  // Guest alert validation
  createGuestAlert: Joi.object({
    nom_patient: Joi.string().required().min(2).max(100).messages({
      "string.empty": "Le nom du patient est requis",
    }),
    telephone_contact: Joi.string()
      .required()
      .pattern(/^6[5-9]\d{7}$/)
      .messages({
        "string.empty": "Le numéro de contact est requis",
        "string.pattern.base": "Format valide: 6XXXXXXXX (9 chiffres)",
      }),
    groupe_sanguin: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .required()
      .messages({
        "any.only": "Le groupe sanguin n'est pas valide",
      }),
    lieu: Joi.string().required().messages({
      "string.empty": "Le lieu est requis",
    }),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    description: Joi.string().allow(""),
  }),

  // Nearby alerts validation
  nearbyAlerts: Joi.object({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180),
    radius: Joi.number().integer().min(1).max(100).default(50),
  }),

  // Search alerts validation
  searchAlerts: Joi.object({
    groupe_sanguin: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
    urgence: Joi.string().valid("NORMAL", "URGENT", "TRES_URGENT"),
    radius: Joi.number().integer().min(1).max(100),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
  }),

  // Public alert respond (guest visitor)
  publicAlertRespond: Joi.object({
    nom: Joi.string().min(2).max(100).required(),
    telephone: Joi.string().min(8).max(20).required(),
    reponse: Joi.string().valid("accepte", "refuse").required(),
  }),
};

module.exports = schemas;
