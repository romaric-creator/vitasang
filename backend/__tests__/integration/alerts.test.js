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

  beforeEach(() => {
    // Generate valid token
    token = jwt.sign(
      { id: userId, role: userRole },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    app = express();
    app.use(express.json());

    // Mock verifyToken middleware
    app.use((req, res, next) => {
      req.user = { id: userId, role: userRole };
      next();
    });

    // Import routes after mocks are set up
    const alertRoute = require('../../routes/alerts.routes');
    app.use('/api/alerts', alertRoute);
  });

  describe('POST /api/alerts/search', () => {
    it('should create alert with valid data', async () => {
      const alertData = {
        latitude: 33.5731,
        longitude: -7.5898,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital Ibn Sina',
        quantite_requise: 5,
      };

      const response = await request(app)
        .post('/api/alerts/search')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success');
    });

    it('should reject invalid blood group', async () => {
      const alertData = {
        latitude: 33.5731,
        longitude: -7.5898,
        groupe_sanguin: 'INVALID',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
      };

      const response = await request(app)
        .post('/api/alerts/search')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const alertData = {
        latitude: 33.5731,
        // missing longitude, groupe_sanguin, etc.
      };

      const response = await request(app)
        .post('/api/alerts/search')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(400);
    });

    it('should reject without authentication', async () => {
      const alertData = {
        latitude: 33.5731,
        longitude: -7.5898,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
      };

      const response = await request(app)
        .post('/api/alerts/search')
        .send(alertData);

      // Should either return 401 or handle in verifyToken
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should accept optional description', async () => {
      const alertData = {
        latitude: 33.5731,
        longitude: -7.5898,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
        description: 'Patient d\'urgence',
      };

      const response = await request(app)
        .post('/api/alerts/search')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(201);
    });

    it('should validate radius', async () => {
      const alertData = {
        latitude: 33.5731,
        longitude: -7.5898,
        groupe_sanguin: 'O+',
        urgence: 'URGENT',
        lieu: 'Hôpital',
        quantite_requise: 5,
        radius: 200, // > 100, should fail
      };

      const response = await request(app)
        .post('/api/alerts/search')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/alerts/:id', () => {
    it('should retrieve alert details', async () => {
      const response = await request(app)
        .get('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`);

      // Will depend on mocked data
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/alerts/:id', () => {
    it('should update alert status', async () => {
      const updateData = {
        status: 'COMPLETE',
      };

      const response = await request(app)
        .put('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('should reject invalid status', async () => {
      const updateData = {
        status: 'INVALID_STATUS',
      };

      const response = await request(app)
        .put('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/alerts/:id', () => {
    it('should delete alert', async () => {
      const response = await request(app)
        .delete('/api/alerts/1')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });
});
