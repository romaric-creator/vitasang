const Joi = require('joi');
const { validateRequest } = require('../../middleware/validation');

describe('Validation Middleware - validateRequest', () => {
  it('should pass valid data through', (done) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    const req = {
      body: { name: 'Jean', email: 'jean@example.com' },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    const middleware = validateRequest(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Jean', email: 'jean@example.com' });
    done();
  });

  it('should reject invalid email', (done) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const req = {
      body: { email: 'invalid-email' },
      query: {},
      params: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const middleware = validateRequest(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    done();
  });

  it('should strip unknown fields', (done) => {
    const schema = Joi.object({
      name: Joi.string().required(),
    });

    const req = {
      body: { name: 'Jean', unknownField: 'value' },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    const middleware = validateRequest(schema);
    middleware(req, res, next);

    expect(req.body.name).toBe('Jean');
    expect(req.body.unknownField).toBeUndefined();
    expect(next).toHaveBeenCalled();
    done();
  });
});
