describe('Authentication Middleware - verifyToken', () => {
  const { verifyToken } = require('../utils/auth.middleware');
  const jwt = require('jsonwebtoken');

  // Mock JWT
  jest.mock('jsonwebtoken');

  it('should return 401 if no token provided', (done) => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    done();
  });

  it('should return 401 if invalid token', (done) => {
    const req = {
      headers: { authorization: 'Bearer invalid_token' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Mock jwt.verify to throw error
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    done();
  });

  it('should call next if valid token', (done) => {
    const mockUser = { id: 1, role: 'donneur' };
    const req = {
      headers: { authorization: 'Bearer valid_token' },
    };
    const res = {};
    const next = jest.fn();

    // Mock jwt.verify to return user
    jwt.verify.mockReturnValue(mockUser);

    verifyToken(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    done();
  });
});
