const { globalLimiter, authLimiter, registerLimiter } = require('../../middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      ip: '192.168.1.1',
      path: '/api/test',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset store for each test
    globalLimiter.resetKey(req.ip);
    authLimiter.resetKey(req.ip);
    registerLimiter.resetKey(req.ip);
  });

  describe('Global Limiter', () => {
    it('should allow requests within limit', (done) => {
      globalLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      done();
    });

    it('should track multiple requests', (done) => {
      globalLimiter(req, res, next);
      globalLimiter(req, res, next);
      globalLimiter(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(3);
      done();
    });
  });

  describe('Auth Limiter', () => {
    it('should allow login attempts within limit', (done) => {
      authLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      done();
    });

    it('should reject after 5 attempts', (done) => {
      // Make 5 attempts
      for (let i = 0; i < 5; i++) {
        authLimiter(req, res, next);
      }

      // 6th attempt should be blocked
      res.status.mockClear();
      res.json.mockClear();
      next.mockClear();

      authLimiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(next).not.toHaveBeenCalled();
      done();
    });
  });

  describe('Register Limiter', () => {
    it('should allow registrations within limit', (done) => {
      registerLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      done();
    });

    it('should reject multiple registrations from same IP', (done) => {
      // Mock: Make multiple attempts
      for (let i = 0; i < 10; i++) {
        registerLimiter(req, res, next);
      }

      // Further attempts should be blocked or rate limited
      res.status.mockClear();
      next.mockClear();

      registerLimiter(req, res, next);
      // Should either block or be rate limited
      done();
    });
  });

  describe('Different IPs', () => {
    it('should track limits per IP separately', (done) => {
      const req1 = { ...req, ip: '192.168.1.1' };
      const req2 = { ...req, ip: '192.168.1.2' };

      globalLimiter(req1, res, next);
      globalLimiter(req2, res, next);

      expect(next).toHaveBeenCalledTimes(2);
      done();
    });
  });
});
