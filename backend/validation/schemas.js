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
      // CORRECTION : Autorise optionnellement un espace après +237 pour la flexibilité
      .pattern(/^(\+237\s?[26]\d{8}|[26]\d{8})$/)
      .messages({
        "string.empty": "Le numéro de téléphone est requis",
        "string.pattern.base":
          "Format valide: +2376XXXXXXXX ou 6XXXXXXXX (9 chiffres)",
      }),
    mot_de_passe: Joi.string().required().min(6).max(255).messages({
      "string.empty": "Le mot de passe est requis",
      "string.min": "Le mot de passe doit avoir au moins 6 caractères",
    }),
    groupe_sanguin: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .required()
      .messages({
        "any.only":
          "Le groupe sanguin doit être: A+, A-, B+, B-, AB+, AB-, O+, O-",
        "string.empty": "Le groupe sanguin est requis",
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
      .pattern(/^(\+237\s?[26]\d{8}|[26]\d{8})$/)
      .messages({
        "string.empty": "Le numéro de téléphone est requis",
        "string.pattern.base": "Numéro invalide (9 chiffres après l'indicatif requis)",
      }),
    mot_de_passe: Joi.string().required().min(6).messages({
      "string.empty": "Le mot de passe est requis",
      "string.min": "Le mot de passe doit avoir au moins 6 caractères",
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
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    radius: Joi.number().integer().min(1).max(500).default(50),
  }),

  // Update user profile
  updateUser: Joi.object({
    nom: Joi.string().min(2).max(100).allow(""),
    prenom: Joi.string().min(2).max(100).allow(""),
    telephone: Joi.string()
      .pattern(/^(\+237\s?[26]\d{8}|[26]\d{8})$/)
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

  // Update alert status
  updateAlert: Joi.object({
    statut: Joi.string()
      .valid("en_cours", "satisfaite", "annulee")
      .required(),
  }),
};

module.exports = schemas;
