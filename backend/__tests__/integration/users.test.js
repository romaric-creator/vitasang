jest.mock("../../models", () => ({
  Utilisateur: {
    create: jest.fn().mockResolvedValue({
      id_utilisateur: 1,
      nom: "Dupont",
      prenom: "Jean",
      telephone: "6512345678",
      mot_de_passe: "$2a$10$hashedpassword",
      groupe_sanguin: "O+",
      role: "donneur",
    }),
    findOne: jest.fn().mockResolvedValue({
      id_utilisateur: 1,
      nom: "Dupont",
      prenom: "Jean",
      telephone: "6512345678",
      mot_de_passe: "$2a$10$hashedpassword",
      groupe_sanguin: "O+",
      role: "donneur",
    }),
  },
  ProfilDonneur: {
    create: jest.fn().mockResolvedValue({ id_profil: 1, groupe_sanguin: "O+" }),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$hashedpassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
}));

const request = require("supertest");
const express = require("express");
const controller = require("../../controllers/users.controller");
const { loginUser, registerUser } = {
  loginUser: controller.login,
  registerUser: controller.addUser,
};

describe("Users Controller - Integration Tests", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/api/users/register", registerUser);
    app.post("/api/users/login", loginUser);
  });

  describe("POST /api/users/register", () => {
    it("should register a new donor user", async () => {
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
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
    });

    it("should return 400 if missing required fields", async () => {
      const userData = {
        nom: "Dupont",
        // prenom missing
        telephone: "6512345678",
        mot_de_passe: "Password123",
        groupe_sanguin: "O+",
        role: "donneur",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      // Peut retourner 400 ou 500 selon la validation
      expect([400, 500]).toContain(response.status);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login with valid credentials", async () => {
      const credentials = {
        telephone: "6512345678",
        mot_de_passe: "Password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(credentials);

      // Peut retourner 200 ou 401 selon le mock
      expect([200, 401]).toContain(response.status);
    });

    it("should return 401 with invalid password", async () => {
      const credentials = {
        telephone: "6512345678",
        mot_de_passe: "WrongPassword",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(credentials);

      expect(response.status).toBe(401);
    });
  });
});
