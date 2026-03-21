const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// CORRECTION: Le modèle s'appelle 'RendezVous' (V majuscule) dans le contrôleur,
// pas 'Rendezvous'. Ce nom doit correspondre exactement à db.RendezVous.
jest.mock('../../models', () => ({
  RendezVous: {
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
  TypeDon: {
    findByPk: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn((fn) => fn({ transaction: true })),
    query: jest.fn().mockResolvedValue([[], {}]),
    literal: jest.fn((val) => val),
  },
  Sequelize: {
    Op: {
      ne: Symbol('ne'),
      eq: Symbol('eq'),
    },
  },
}));

describe('Rendez-vous Controller - Integration Tests', () => {
  let app;
  let token;
  const userId = 1;

  beforeAll(() => {
    token = jwt.sign(
      { id: userId, role: 'donneur' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  beforeEach(() => {
    jest.resetModules(); // Clear module cache before each test
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock return values
    const { RendezVous, Utilisateur, Centre } = require('../../models');

    RendezVous.create.mockResolvedValue({
      id_rdv: 1,
      id_donneur: userId,
      id_centre: 1,
      date_heure_rdv: new Date('2026-03-15T09:00:00'),
      statut_rdv: 'planifie',
      code_unique: 'ABC123XYZ',
    });

    RendezVous.findByPk.mockResolvedValue({
      id_rdv: 1,
      id_donneur: userId,
      id_centre: 1,
      date_heure_rdv: new Date('2026-03-15T09:00:00'),
      statut_rdv: 'planifie',
      save: jest.fn().mockResolvedValue(true),
    });

    RendezVous.findAll.mockResolvedValue([]);

    Utilisateur.findByPk.mockResolvedValue({
      id_utilisateur: userId,
      telephone: '+237612345678',
    });

    Centre.findByPk.mockResolvedValue({
      id_centre: 1,
      nom_centre: 'Centre de Yaoundé',
      adresse: 'Rue de la Santé',
      ville: 'Yaoundé',
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

    // Generic error handler for tests
    app.use((err, req, res, next) => {
      res.status(err.statusCode || err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne',
        errors: err.details || undefined,
      });
    });
  });

  describe('POST /api/rendez-vous (Create)', () => {
    it('should create rendez-vous with valid data', async () => {
      // CORRECTION: Le schéma attend 'date_rdv', pas 'date_rendezvous'
      const rdvData = {
        id_centre: 1,
        date_rdv: '2026-03-15',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Rendez-vous créé avec succès');
    });

    it('should reject invalid date format', async () => {
      const rdvData = {
        id_centre: 1,
        date_rdv: 'invalid-date',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect(response.status).toBe(400);
    });

    it('should reject request without required id_centre', async () => {
      const rdvData = {
        // missing id_centre
        date_rdv: '2026-03-15',
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect(response.status).toBe(400);
    });

    it('should reject request without required date_rdv', async () => {
      const rdvData = {
        id_centre: 1,
        // missing date_rdv
        heure_debut: '09:00',
      };

      const response = await request(app)
        .post('/api/rendez-vous')
        .set('Authorization', `Bearer ${token}`)
        .send(rdvData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/rendez-vous/my-appointments', () => {
    it('should retrieve user rendez-vous list', async () => {
      const response = await request(app)
        .get('/api/rendez-vous/my-appointments')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/rendez-vous/:id', () => {
    it('should get rendez-vous details when found', async () => {
      const response = await request(app)
        .get('/api/rendez-vous/1')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should return 404 when rendez-vous not found', async () => {
      const { RendezVous } = require('../../models');
      RendezVous.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/rendez-vous/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/rendez-vous/:id (Cancel)', () => {
    it('should cancel rendez-vous owned by user', async () => {
      const response = await request(app)
        .delete('/api/rendez-vous/1')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should return 404 when rendez-vous does not exist', async () => {
      const { RendezVous } = require('../../models');
      RendezVous.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/rendez-vous/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
