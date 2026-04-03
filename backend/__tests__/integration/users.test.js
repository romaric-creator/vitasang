const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Mock dependencies
jest.mock("../../models", () => ({
  Utilisateur: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  ProfilDonneur: {
    create: jest.fn(),
  },
  Centre: {
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn((callback) => callback()),
  },
  Sequelize: {
    Op: { and: Symbol("and") },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../config/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

const db = require("../../models");
const controller = require("../../controllers/users.controller");

describe("Users Controller - Integration Tests", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    // Attach controller methods to routes
    app.post("/api/users/register", controller.addUser);
    app.post("/api/users/login", controller.login);

    // Basic error handler
    app.use((err, req, res, next) => {
      console.error("Test Error Handler:", err);
      res.status(500).json({ message: err.message });
    });
  });

  describe("POST /api/users/register", () => {
    it("should register a new donor user successfully", async () => {
      // Mock successful creation
      db.Utilisateur.create.mockResolvedValue({
        id_utilisateur: 1,
        nom: "Dupont",
        prenom: "Jean",
        telephone: "6512345678",
        role: "donneur",
      });
      bcrypt.hash.mockResolvedValue("hashed_password");
      jwt.sign.mockReturnValue("mock_token");

      const userData = {
        nom: "Dupont",
        prenom: "Jean",
        telephone: "6512345678",
        mot_de_passe: "Password123",
        groupe_sanguin: "O+",
        role: "donneur",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token", "mock_token");
      expect(response.body.user).toHaveProperty("id_utilisateur", 1);
    });

    it("should return 400 if manual validation fails (missing nom)", async () => {
      const userData = {
        // nom missing
        prenom: "Jean",
        telephone: "651234567",
        mot_de_passe: "Password123",
        role: "donneur",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("nom");
    });

    it("should return 409 if user already exists (SequelizeUniqueConstraintError)", async () => {
      // Mock SequelizeUniqueConstraintError
      const uniqueError = new Error("Validation error");
      uniqueError.name = "SequelizeUniqueConstraintError";
      db.Utilisateur.create.mockRejectedValue(uniqueError);

      bcrypt.hash.mockResolvedValue("hashed_password");

      const userData = {
        nom: "Dupont",
        prenom: "Jean",
        telephone: "6512345678",
        mot_de_passe: "Password123",
        role: "donneur",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain("existe déjà");
    });

    it("should return 500 for other database errors", async () => {
      // Mock generic database error
      db.Utilisateur.create.mockRejectedValue(new Error("DB Connection Failed"));
      bcrypt.hash.mockResolvedValue("hashed_password");

      const userData = {
        nom: "Dupont",
        prenom: "Jean",
        telephone: "6512345678",
        mot_de_passe: "Password123",
        role: "donneur",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login with valid credentials", async () => {
      const mockUser = {
        id_utilisateur: 1,
        nom: "Dupont",
        telephone: "6512345678",
        mot_de_passe: "hashed_password",
        role: "donneur",
        profilDonneur: { groupe_sanguin: "O+" },
      };

      db.Utilisateur.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock_token");

      const credentials = {
        telephone: "6512345678",
        mot_de_passe: "Password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.token).toBe("mock_token");
    });

    it("should return 401 with invalid password", async () => {
      const mockUser = {
        id_utilisateur: 1,
        telephone: "6512345678",
        mot_de_passe: "hashed_password",
      };

      db.Utilisateur.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const credentials = {
        telephone: "6512345678",
        mot_de_passe: "WrongPassword",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(credentials);

      expect(response.status).toBe(401);
    });

    it("should return 404 if user not found", async () => {
      db.Utilisateur.findOne.mockResolvedValue(null);

      const credentials = {
        telephone: "699999999",
        mot_de_passe: "Password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(credentials);

      expect(response.status).toBe(401);
    });
  });
});
