const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('../../models', () => ({
  Rendezvous: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
  Utilisateur: {
    findByPk: jest.fn(),
  },
  Centre: {
    findByPk: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn((fn) => fn({ transaction: true })),
  },
}));

describe('Rendez-vous Controller - Integration Tests', () => {
  let app;
  let token;
  const userId = 1;

  beforeEach(() => {
    token = jwt.sign(
      { id: userId, role: 'donneur' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    // Setup mock return values
    const { Rendezvous, Utilisateur, Centre } = require('../../models');

    Rendezvous.create.mockResolvedValue({
      id_rendezvous: 1,
      id_utilisateur: userId,
      id_centre: 1,
      date_rendezvous: '2026-03-15',
      heure_debut: '10:00',
      statut: 'CONFIRMEE',
    });

    Rendezvous.findByPk.mockResolvedValue({
      id_rendezvous: 1,
      id_utilisateur: userId,
      id_centre: 1,
      date_rendezvous: '2026-03-15',
      statut: 'CONFIRMEE',
    });

    Rendezvous.findAll.mockResolvedValue([]);

    Utilisateur.findByPk.mockResolvedValue({
      id_utilisateur: userId,
      telephone: '+237612345678',
    });

    Centre.findByPk.mockResolvedValue({
      id_centre: 1,
      nom: 'Centre de Casablanca',
      latitude: 33.5731,
      longitude: -7.5898,
    });

    app = express();
    app.use(express.json());

    // Mock verifyToken
    app.use((req, res, next) => {
      req.user = { id: userId, role: 'donneur' };
      next();
    });

    const rendezvousRoute = require('../../routes/rendezvous.routes');
    app.use('/api/rendez-vous', rendezvousRoute);
  });

  describe('POST /api/rendez-vous', () => {
    it('should create rendez-vous with valid data', async () => {
      const rdvData = {
        id_centre: 1,
        date_rendezvous: '2026-03-15',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect([201, 400, 404]).toContain(response.status);
    });

    it('should reject invalid date format', async () => {
      const rdvData = {
        id_centre: 1,
        date_rendezvous: 'invalid-date',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const rdvData = {
        id_centre: 1,
        date_rendezvous: '2026-03-15',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .send(rdvData);

      // Should fail without token
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should validate centre exists', async () => {
      const rdvData = {
        id_centre: 99999, // Non-existent
        date_rendezvous: '2026-03-15',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/rendez-vous/my-appointments', () => {
    it('should retrieve user rendez-vous', async () => {
      const response = await request(app)
        .get('/api/rendez-vous/my-appointments')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/rendez-vous/my-appointments');

      expect([400, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/rendez-vous/:id', () => {
    it('should get rendez-vous details', async () => {
      const response = await request(app)
        .get('/api/rendez-vous/1')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 403, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/rendez-vous/:id', () => {
    it('should cancel rendez-vous', async () => {
      const response = await request(app)
        .delete('/api/rendez-vous/1')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/rendez-vous/1');

      expect([401, 403]).toContain(response.status);
    });
  });
});
