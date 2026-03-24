const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VitaSang Blood Donation API',
      version: '1.0.0',
      description: 'API for managing blood donations and alerts',
      contact: {
        name: 'VitaSang Support',
        email: 'support@vitasang.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      },
      {
        url: 'https://api.vitasang.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token obtained after login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Une erreur est survenue' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id_utilisateur: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Dupont' },
            prenom: { type: 'string', example: 'Jean' },
            telephone: { type: 'string', example: '699999999' },
            email: { type: 'string', format: 'email', example: 'jean.dupont@email.com' },
            role: { type: 'string', enum: ['donneur', 'personnel', 'admin', 'cnts'], example: 'donneur' },
            photo_profil: { type: 'string', example: 'https://cloudinary.com/vitasang/profile.jpg' },
            est_actif: { type: 'boolean', example: true },
            profilDonneur: { $ref: '#/components/schemas/ProfilDonneur' }
          }
        },
        ProfilDonneur: {
          type: 'object',
          properties: {
            groupe_sanguin: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], example: 'O+' },
            disponible: { type: 'boolean', example: true },
            poids: { type: 'number', example: 75.5 },
            taille: { type: 'number', example: 1.80 },
            lat_actuelle: { type: 'number', example: 3.848 },
            long_actuelle: { type: 'number', example: 11.502 }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id_alerte: { type: 'integer', example: 101 },
            groupe_requis: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'INCONNU'], example: 'O+' },
            degre_urgence: { type: 'string', enum: ['NORMAL', 'URGENT', 'TRES_URGENT'], example: 'URGENT' },
            lieu: { type: 'string', example: 'Hôpital Central de Yaoundé' },
            latitude: { type: 'number', example: 3.866 },
            longitude: { type: 'number', example: 11.517 },
            quantite_requise: { type: 'integer', example: 3 },
            description: { type: 'string', example: 'Besoin urgent de sang O+ suite à un accident.' },
            statut: { type: 'string', enum: ['en_attente_validation', 'en_cours', 'resolu', 'annule'], example: 'en_cours' },
            telephone_contact: { type: 'string', example: '691234567' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Centre: {
          type: 'object',
          properties: {
            id_centre: { type: 'integer', example: 1 },
            nom_centre: { type: 'string', example: 'CNTS Yaoundé' },
            adresse: { type: 'string', example: 'Quartier Messa' },
            ville: { type: 'string', example: 'Yaoundé' },
            contact_urgence: { type: 'string', example: '222-333-444' },
            latitude: { type: 'number', example: 3.861 },
            longitude: { type: 'number', example: 11.511 }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
