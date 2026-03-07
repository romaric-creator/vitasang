const request = require('supertest');
const express = require('express');
const { loginUser, registerUser } = require('../../controllers/users.controller');

// Mock database
jest.mock('../../models', () => ({
  Utilisateur: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  ProfilDonneur: {
    create: jest.fn(),
  },
}));

describe('Users Controller - Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/users/register', registerUser);
    app.post('/api/users/login', loginUser);
  });

  describe('POST /api/users/register', () => {
    it('should register a new donor user', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '+237612345678',
        mot_de_passe: 'Password123',
        groupe_sanguin: 'O+',
        role: 'donneur',
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 400 if missing required fields', async () => {
      const userData = {
        nom: 'Dupont',
        // prenom missing
        telephone: '+237612345678',
        mot_de_passe: 'Password123',
        groupe_sanguin: 'O+',
        role: 'donneur',
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        telephone: '+237612345678',
        mot_de_passe: 'Password123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 with invalid password', async () => {
      const credentials = {
        telephone: '+237612345678',
        mot_de_passe: 'WrongPassword',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials);

      expect(response.status).toBe(401);
    });
  });
});
