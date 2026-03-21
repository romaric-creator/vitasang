const request = require('supertest');
const app = require('../../index');
const db = require('../../models');

describe('Alert Endpoints Integration Tests', () => {
  let authToken;
  let testAlertId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: false });

    // Create a test user and get token
    const response = await request(app)
      .post('/api/users/register')
      .send({
        nom: 'Alert',
        prenom: 'Tester',
        telephone: '+212633333333',
        mot_de_passe: 'AlertTest123',
        groupe_sanguin: 'AB-',
        ville: 'Fes'
      });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/alerts/create', () => {
    it('should create a new alert with valid data', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'O+',
          urgence: 'URGENT',
          lieu: 'Hôpital Ibn Sina',
          longitude: -7.5898,
          latitude: 33.5731,
          quantite_requise: 5,
          description: 'Transfusion d\'urgence nécessaire'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.alerte).toBeDefined();
      testAlertId = response.body.alerte.id_alerte;
    });

    it('should reject alert creation with invalid blood type', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'INVALID',
          urgence: 'URGENT',
          lieu: 'Hôpital',
          longitude: -7.5898,
          latitude: 33.5731,
          quantite_requise: 5
        });

      expect(response.status).toBe(400);
    });

    it('should reject alert creation with invalid urgency level', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'O+',
          urgence: 'INVALID_LEVEL',
          lieu: 'Hôpital',
          longitude: -7.5898,
          latitude: 33.5731,
          quantite_requise: 5
        });

      expect(response.status).toBe(400);
    });

    it('should reject alert creation with invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'O+',
          urgence: 'URGENT',
          lieu: 'Hôpital',
          longitude: 'invalid',
          latitude: 33.5731,
          quantite_requise: 5
        });

      expect(response.status).toBe(400);
    });

    it('should reject alert creation with negative quantity', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'O+',
          urgence: 'URGENT',
          lieu: 'Hôpital',
          longitude: -7.5898,
          latitude: 33.5731,
          quantite_requise: -5
        });

      expect(response.status).toBe(400);
    });

    it('should reject alert creation without token', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .send({
          groupe_sanguin: 'O+',
          urgence: 'URGENT',
          lieu: 'Hôpital',
          longitude: -7.5898,
          latitude: 33.5731,
          quantite_requise: 5
        });

      expect(response.status).toBe(401);
    });

    it('should reject alert creation with missing required fields', async () => {
      const response = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'O+'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/alerts/nearby', () => {
    it('should get nearby alerts with valid coordinates', async () => {
      const response = await request(app)
        .get('/api/alerts/nearby')
        .query({
          lat: 33.5731,
          lng: -7.5898,
          radius: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.alertes).toBeDefined();
      expect(Array.isArray(response.body.alertes)).toBe(true);
    });

    it('should reject nearby with invalid latitude', async () => {
      const response = await request(app)
        .get('/api/alerts/nearby')
        .query({
          lat: 'invalid',
          lng: -7.5898,
          radius: 10
        });

      expect(response.status).toBe(400);
    });

    it('should reject nearby with invalid radius', async () => {
      const response = await request(app)
        .get('/api/alerts/nearby')
        .query({
          lat: 33.5731,
          lng: -7.5898,
          radius: -10
        });

      expect(response.status).toBe(400);
    });

    it('should return empty array when no alerts found', async () => {
      const response = await request(app)
        .get('/api/alerts/nearby')
        .query({
          lat: 90,
          lng: 180,
          radius: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.alertes).toBeDefined();
    });
  });

  describe('GET /api/alerts/search', () => {
    it('should search alerts by blood type', async () => {
      const response = await request(app)
        .get('/api/alerts/search')
        .query({
          groupe_sanguin: 'O+'
        });

      expect(response.status).toBe(200);
      expect(response.body.alertes).toBeDefined();
      expect(Array.isArray(response.body.alertes)).toBe(true);
    });

    it('should reject search with invalid blood type', async () => {
      const response = await request(app)
        .get('/api/alerts/search')
        .query({
          groupe_sanguin: 'INVALID'
        });

      expect(response.status).toBe(400);
    });

    it('should search alerts by urgency', async () => {
      const response = await request(app)
        .get('/api/alerts/search')
        .query({
          urgence: 'URGENT'
        });

      expect(response.status).toBe(200);
      expect(response.body.alertes).toBeDefined();
    });
  });

  describe('PUT /api/alerts/:id', () => {
    it('should update alert with valid data', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          urgence: 'TRES_URGENT',
          quantite_requise: 10
        });

      expect(response.status).toBe(200);
    });

    it('should reject update with invalid urgency', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          urgence: 'INVALID'
        });

      expect(response.status).toBe(400);
    });

    it('should reject update without token', async () => {
      const response = await request(app)
        .put(`/api/alerts/${testAlertId}`)
        .send({
          urgence: 'URGENT'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/alerts/:id', () => {
    it('should delete alert with valid token', async () => {
      // First create an alert to delete
      const createResponse = await request(app)
        .post('/api/alerts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupe_sanguin: 'B+',
          urgence: 'NORMAL',
          lieu: 'Clinique Privée',
          longitude: -7.5898,
          latitude: 33.5731,
          quantite_requise: 3
        });

      const alertIdToDelete = createResponse.body.alerte.id_alerte;

      const deleteResponse = await request(app)
        .delete(`/api/alerts/${alertIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
    });

    it('should reject delete without token', async () => {
      const response = await request(app)
        .delete(`/api/alerts/${testAlertId}`);

      expect(response.status).toBe(401);
    });
  });
});
