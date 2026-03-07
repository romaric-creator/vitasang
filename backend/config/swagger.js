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
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id_utilisateur: {
              type: 'integer'
            },
            nom: {
              type: 'string'
            },
            prenom: {
              type: 'string'
            },
            telephone: {
              type: 'string'
            },
            groupe_sanguin: {
              type: 'string',
              enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            },
            ville: {
              type: 'string'
            },
            latitude: {
              type: 'number'
            },
            longitude: {
              type: 'number'
            },
            date_naissance: {
              type: 'string',
              format: 'date'
            },
            actif: {
              type: 'boolean'
            }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id_alerte: {
              type: 'integer'
            },
            id_utilisateur: {
              type: 'integer'
            },
            groupe_sanguin: {
              type: 'string',
              enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            },
            urgence: {
              type: 'string',
              enum: ['NORMAL', 'URGENT', 'TRES_URGENT']
            },
            lieu: {
              type: 'string'
            },
            latitude: {
              type: 'number'
            },
            longitude: {
              type: 'number'
            },
            quantite_requise: {
              type: 'integer'
            },
            description: {
              type: 'string'
            },
            date_creation: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'COMPLETE', 'CANCELLED']
            }
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
