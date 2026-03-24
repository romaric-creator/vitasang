import * as yup from 'yup';

// Validation schemas for frontend forms

export const loginValidationSchema = yup.object().shape({
  telephone: yup
    .string()
    .required('Le numéro est requis')
    .matches(
      /^(\+2376\d{8}|6\d{8})$/,
      'Format: +237 6XXXXXXXX ou 6XXXXXXXX (Mobile uniquement)'
    ),
  mot_de_passe: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Au minimum 6 caractères')
    .max(50, 'Maximum 50 caractères')
});

export const registerValidationSchema = yup.object().shape({
  nom: yup
    .string()
    .required('Le nom est requis')
    .min(2, 'Au minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  prenom: yup
    .string()
    .required('Le prénom est requis')
    .min(2, 'Au minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  telephone: yup
    .string()
    .transform((value, originalValue) => {
        // Supprime tous les espaces avant validation
        return originalValue ? originalValue.replace(/\s/g, '') : value;
    })
    .required('Le numéro est requis')
    .matches(
      /^(\+2376\d{8}|6\d{8})$/,
      'Format: +237 6XXXXXXXX ou 6XXXXXXXX (Mobile uniquement)'
    ),
  mot_de_passe: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Au minimum 6 caractères')
    .max(50, 'Maximum 50 caractères')
    // Simplification : on retire les contraintes trop strictes de regex pour l'instant si demandé,
    // mais gardons un minimum de sécurité
    .matches(/[A-Z]/, 'Au moins une majuscule')
    .matches(/[0-9]/, 'Au moins un chiffre'),
  // confirmPassword removed for simplicity
  groupe_sanguin: yup
    .string()
    .nullable()
    .transform((v) => (v === "" ? null : v)) // Transforme chaine vide en null
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'INCONNU', null], 'Groupe sanguin invalide'),
});

export const createAlertValidationSchema = yup.object().shape({
  groupe_sanguin: yup
    .string()
    .required('Le groupe sanguin est requis')
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'INCONNU'], 'Groupe sanguin invalide'),
  urgence: yup
    .string()
    .required('Le niveau d\'urgence est requis')
    .oneOf(['NORMAL', 'URGENT', 'TRES_URGENT'], 'Niveau d\'urgence invalide'),
  lieu: yup
    .string()
    .required('Le lieu est requis')
    .min(3, 'Au minimum 3 caractères'),
  latitude: yup
    .number()
    .required('La latitude est requise'),
  longitude: yup
    .number()
    .required('La longitude est requise'),
  quantite_requise: yup
    .number()
    .required('Quantité requise')
    .min(1, 'Minimum 1 poche')
    .max(100, 'Maximum 100 poches'),
  description: yup
    .string()
    .max(500, 'Maximum 500 caractères'),
  telephone_contact: yup
    .string()
    .required('Le numéro de contact est requis')
    .matches(
      /^(\+2376\d{8}|6\d{8})$/,
      'Format: +237 6XXXXXXXX ou 6XXXXXXXX (Mobile uniquement)'
    ),
});

export const searchDonorsValidationSchema = yup.object().shape({
  latitude: yup
    .number()
    .required('La latitude est requise')
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide'),
  longitude: yup
    .number()
    .required('La longitude est requise')
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide'),
  radius: yup
    .number()
    .required('Le rayon est requis')
    .min(1, 'Minimum 1 km')
    .max(100, 'Maximum 100 km'),
  groupe_sanguin: yup
    .string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'TOUS'], 'Groupe sanguins invalide')
});

export const updateLocationValidationSchema = yup.object().shape({
  latitude: yup
    .number()
    .required('La latitude est requise')
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide'),
  longitude: yup
    .number()
    .required('La longitude est requise')
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide')
});

export const editProfileValidationSchema = yup.object().shape({
  nom: yup
    .string()
    .required('Le nom est requis')
    .min(2, 'Au minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  prenom: yup
    .string()
    .required('Le prénom est requis')
    .min(2, 'Au minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  telephone: yup
    .string()
    .required('Le numéro est requis')
    .matches(
      /^(\+2376\d{8}|6\d{8})$/,
      'Format: +237 6XXXXXXXX ou 6XXXXXXXX (Mobile uniquement)'
    ),
  groupe_sanguin: yup
    .string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Groupe sanguin invalide')
    .nullable(),
  ville: yup
    .string()
    .required('La ville est requise')
    .min(2, 'Au minimum 2 caractères')
});
