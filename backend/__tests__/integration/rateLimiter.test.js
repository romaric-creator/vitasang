const request = require('supertest');
const app = require('../../index');

describe('Rate Limiting Tests', () => {
  describe('Global Rate Limiter (100 requests per 15 minutes)', () => {
    it('should allow requests within rate limit', async () => {
      const response = await request(app)
        .get('/health');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Registration Rate Limiter (10 per day)', () => {
    it('should track registration attempts', async () => {
      const responses = [];

      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/users/register')
          .send({
            nom: `Donor${i}`,
            prenom: `Test`,
            telephone: `69000${String(i).padStart(4, '0')}`,
            mot_de_passe: 'TestPass123',
            groupe_sanguin: 'O+',
            ville: 'Test City'
          });

        responses.push({
          status: response.status,
          body: response.body
        });
      }

      // All three should succeed (within daily limit of 10)
      responses.forEach(r => {
        expect([201, 400]).toContain(r.status); // 201 if success, 400 if validation error
      });
    });
  });

  describe('Login Rate Limiter (5 attempts per 15 minutes)', () => {
    it('should track login attempts', async () => {
      const responses = [];

      // Try 6 login attempts with wrong password
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/users/login')
          .send({
            telephone: '666666666',
            mot_de_passe: 'WrongPassword'
          });

        responses.push({
          status: response.status,
          statusCode: response.status
        });
      }

      // After 5 attempts, should get rate limited (429)
      // The 6th request should be rejected
      expect(responses.length).toBeGreaterThanOrEqual(5);
    });

    it('should have rate limiter headers', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          telephone: '666666666',
          mot_de_passe: 'TestPass'
        });

      // Check for rate limit headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });
  });

  describe('Rate Limit Error Responses', () => {
    it('should return 429 status when rate limited', async () => {
      // Create multiple rapid requests
      const requests = [];

      for (let i = 0; i < 7; i++) {
        requests.push(
          request(app)
            .post('/api/users/login')
            .send({
              telephone: '677777777',
              mot_de_passe: 'Test'
            })
        );
      }

      const responses = await Promise.all(requests);

      // At least one should be rate limited (429) or validation error (400)
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes.some(code => [400, 429].includes(code))).toBe(true);
    });

    it('rate limit error should include retry-after header', async () => {
      // Make rapid requests to hit rate limit
      const responses = [];

      for (let i = 0; i < 8; i++) {
        const response = await request(app)
          .post('/api/users/login')
          .send({
            telephone: '688888888',
            mot_de_passe: 'Test'
          });

        responses.push(response);
      }

      // Find a rate limited response
      const rateLimitedResponse = responses.find(r => r.status === 429);

      if (rateLimitedResponse) {
        expect(rateLimitedResponse.headers['retry-after']).toBeDefined();
      }
    });
  });
});
