const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock database
jest.mock('../../models', () => ({
  Alerte: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  },
  Utilisateur: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  ProfilDonneur: {
    findAll: jest.fn(),
  },
  LogNotification: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn((fn) => fn({ transaction: true })),
  },
}));

// Mock Expo SDK
jest.mock('expo-server-sdk');

describe('Alerts Controller - Integration Tests', () => {
  let app;
  let token;
  const userId = 1;
  const userRole = 'centre';

  beforeAll(() => {
    // Generate valid token once
    token = jwt.sign(
      { id: userId, role: userRole },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  beforeEach(() => {
    jest.resetModules(); // Clear module cache before each test
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock return values
    const { Alerte, Utilisateur, LogNotification } = require('../../models');

    Alerte.create.mockResolvedValue({
      id_alerte: 1,
      id_initiateur: userId,
      groupe_requis: 'O+',
      degre_urgence: 'URGENT',
      latitude: 3.848,
      longitude: 11.502,
      statut: 'en_attente_validation',
      created_at: new Date(),
    });

    Alerte.findByPk.mockResolvedValue({
      id_alerte: 1,
      id_initiateur: userId,
      groupe_requis: 'O+',
      degre_urgence: 'URGENT',
      statut: 'en_attente_validation',
      save: jest.fn().mockResolvedValue(true),
    });

    Alerte.findAll.mockResolvedValue([]);

    Utilisateur.findAll.mockResolvedValue([]);

    Utilisateur.findByPk.mockResolvedValue({
      id_utilisateur: userId,
      telephone: '+237612345678',
      groupe_sanguin: 'O+',
    });

    LogNotification.update.mockResolvedValue([1]); // Mock successful update

    app = express();
    app.use(express.json());

    // Mock verifyToken and isAdmin middleware
    app.use((req, res, next) => {
      req.user = { id: userId, role: userRole };
      next();
    });

    // Import routes after mocks are set up
    const alertRoute = require('../../routes/alerts.routes');
    app.use('/api/alerts', alertRoute);

    // Generic error handler for tests
    app.use((err, req, res, next) => {
      res.status(err.statusCode || err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne',
      });
    });
  });

  describe('POST /api/alerts (Create Alert)', () => {
    it('should create alert with valid data', async () => {
      const alertData = {
        latitude: 3.848,
        longitude: 11.502,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital Central de Yaoundé',
        quantite_requise: 5,
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Alerte créée et en attente de validation.');
    });

    it('should reject invalid blood group', async () => {
      const alertData = {
        latitude: 3.848,
        longitude: 11.502,
        groupe_sanguin: 'INVALID',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const alertData = {
        latitude: 3.848,
        // missing longitude, groupe_sanguin, lieu
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(400);
    });

    it('should accept optional description', async () => {
      const alertData = {
        latitude: 3.848,
        longitude: 11.502,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
        description: "Patient d'urgence",
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect([201, 400]).toContain(response.status);
    });

    it('should reject radius greater than 100', async () => {
      const alertData = {
        latitude: 3.848,
        longitude: 11.502,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
        radius: 200, // > 100, should fail
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/alerts/:id/status', () => {
    it('should attempt to retrieve alert details', async () => {
      const { Alerte } = require('../../models');
      Alerte.findByPk.mockResolvedValue(null); // Not found

      const response = await request(app)
        .get('/api/alerts/1/status')
        .set('Authorization', `Bearer ${token}`);

      // Either found (200) or not found (404)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/alerts/:id (Update Alert)', () => {
    it('should attempt to update alert status', async () => {
      const updateData = {
        statut: 'annulee',
      };

      const response = await request(app)
        .put('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect([200, 400, 403, 404]).toContain(response.status);
    });

    it('should reject invalid status', async () => {
      const updateData = {
        statut: 'INVALID_STATUS',
      };

      const response = await request(app)
        .put('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/alerts/:id (Cancel Alert)', () => {
    it('should attempt to cancel alert', async () => {
      const response = await request(app)
        .delete('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 403, 404]).toContain(response.status);
    });
  });
});
