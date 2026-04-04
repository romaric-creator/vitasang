const { validateRequest } = require('../../middleware/validation');
const schemas = require('../../validation/schemas');

describe('Validation Middleware', () => {
  const mockReq = (body = {}, query = {}, params = {}) => ({
    body,
    query,
    params,
    path: '/api/test',
    method: 'POST',
    ip: '127.0.0.1',
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login validation', () => {
    test('should pass with valid login data', () => {
      const req = mockReq({
        telephone: '655123456', // 9 digits: 6 + 5 + 7 digits
        mot_de_passe: 'password123',
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.login);
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject invalid telephone', () => {
      const req = mockReq({
        telephone: 'invalid',
        mot_de_passe: 'password123',
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.login);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject short password', () => {
      const req = mockReq({
        telephone: '6551234567',
        mot_de_passe: 'short',
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.login);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Register validation', () => {
    test('should pass with valid register data', () => {
      const req = mockReq({
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '655123456', // 9 digits: 6 + 55 + 123456 = 655123456
        mot_de_passe: 'Password123',
        groupe_sanguin: 'O+',
        role: 'donneur',
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.register);
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject invalid blood type', () => {
      const req = mockReq({
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '6551234567',
        mot_de_passe: 'password123',
        groupe_sanguin: 'INVALID',
        role: 'donneur',
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.register);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject missing required fields', () => {
      const req = mockReq({
        nom: 'Dupont',
        // Missing prenom, telephone, etc.
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.register);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Search users validation', () => {
    test('should pass with valid search data', () => {
      const req = mockReq({
        latitude: 48.8566,
        longitude: 2.3522,
        groupe_sanguin: 'O+',
        radius: 10,
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.searchUsers);
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject invalid coordinates', () => {
      const req = mockReq({
        latitude: 'invalid',
        longitude: 2.3522,
        groupe_sanguin: 'O+',
      });
      const res = mockRes();

      const middleware = validateRequest(schemas.searchUsers);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
