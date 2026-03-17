const { verifyToken } = require("../../utils/auth.middleware");
const jwt = require("jsonwebtoken");

// Setup
process.env.JWT_SECRET = "test-secret-key-for-testing";

describe("Auth Middleware - verifyToken", () => {
  const mockReq = (token = null) => ({
    headers: {
      authorization: token ? `Bearer ${token}` : null,
    },
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

  test("should call next() with valid token", () => {
    const validToken = jwt.sign(
      { id: 1, telephone: "655123456" },
      "test-secret-key-for-testing",
      { expiresIn: "7d" },
    );

    const req = mockReq(validToken);
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
  });

  test("should return 401 if no token provided", () => {
    const req = mockReq(null);
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Un token est requis pour l'authentification",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid", () => {
    const req = mockReq("invalid-token");
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide ou expiré",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
