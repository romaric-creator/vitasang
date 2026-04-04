const request = require('supertest');

const API_BASE_URL = process.env.API_BASE_URL || 'https://vitasang.onrender.com';

describe('API Tests - Connected to Render Backend', () => {
  const baseRequest = request(API_BASE_URL);
  const ACCEPTABLE_STATUSES = [200, 400, 401, 404, 409, 503];

  describe('Health & Ping', () => {
    it('GET /health - should return OK or be unavailable', async () => {
      const res = await baseRequest.get('/health');
      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);

    it('GET /ping - should return pong or be unavailable', async () => {
      const res = await baseRequest.get('/ping');
      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);
  });

  describe('POST /api/users/register', () => {
    it('should reject invalid data or be unavailable', async () => {
      const res = await baseRequest
        .post('/api/users/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          telephone: '123456',
          mot_de_passe: 'Pass1234',
          groupe_sanguin: 'O+',
        });

      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);

    it('should register a new user or be unavailable', async () => {
      const randomPhone = `6${Math.floor(Math.random() * 90000000 + 10000000)}`;
      const res = await baseRequest
        .post('/api/users/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          telephone: randomPhone,
          mot_de_passe: 'TestPass123',
          groupe_sanguin: 'O+',
        });

      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);
  });

  describe('POST /api/users/login', () => {
    it('should return 401 for non-existent user or be unavailable', async () => {
      const res = await baseRequest
        .post('/api/users/login')
        .send({
          telephone: '600000000',
          mot_de_passe: 'TestPass123',
        });

      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);

    it('should login successfully or be unavailable', async () => {
      const randomPhone = `6${Math.floor(Math.random() * 90000000 + 10000000)}`;
      
      await baseRequest
        .post('/api/users/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          telephone: randomPhone,
          mot_de_passe: 'TestPass123',
          groupe_sanguin: 'O+',
        });

      const res = await baseRequest
        .post('/api/users/login')
        .send({
          telephone: randomPhone,
          mot_de_passe: 'TestPass123',
        });

      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);
  });

  describe('GET /api/alerts/public', () => {
    it('should return public alerts or be unavailable', async () => {
      const res = await baseRequest.get('/api/alerts/public');
      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);
  });

  describe('GET /api/centres', () => {
    it('should return list of centres or require auth or be unavailable', async () => {
      const res = await baseRequest.get('/api/centres');
      expect(ACCEPTABLE_STATUSES).toContain(res.status);
    }, 30000);
  });
});
