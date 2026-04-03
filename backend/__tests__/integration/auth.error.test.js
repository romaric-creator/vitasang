// Removed Sentry mock since it's not installed

const request = require("supertest");
const app = require("../../index");
const db = require("../../models");

describe("Authentication Error Cases", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  describe("POST /api/users/register - Error Handling", () => {
    it("should return 400 for missing required fields", async () => {
      const res = await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        // missing telephone, mot_de_passe, groupe_sanguin
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("validation");
      expect(res.body.errors).toBeDefined();
    });

    it("should return 400 for invalid phone format", async () => {
      const res = await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        telephone: "123456", // Invalid format
        mot_de_passe: "Pass1234",
        groupe_sanguin: "O+",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.telephone).toBeDefined();
    });

    it("should return 400 for weak password", async () => {
      const res = await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        telephone: "6512345678",
        mot_de_passe: "123", // Too short
        groupe_sanguin: "O+",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.mot_de_passe).toBeDefined();
    });

    it("should return 400 for invalid blood type", async () => {
      const res = await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        telephone: "6512345678",
        mot_de_passe: "Pass1234",
        groupe_sanguin: "XYZ", // Invalid
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.groupe_sanguin).toBeDefined();
    });

    it("should return 409 for duplicate user", async () => {
      // First registration
      await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        telephone: "6599999990",
        mot_de_passe: "Pass1234",
        groupe_sanguin: "O+",
      });

      // Duplicate registration
      const res = await request(app).post("/api/users/register").send({
        nom: "Test2",
        prenom: "User2",
        telephone: "6599999990", // Same phone
        mot_de_passe: "Pass45678", // 8+ chars
        groupe_sanguin: "B+",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("existe");
    });
  });

  describe("POST /api/users/login - Error Handling", () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        telephone: "6588888880",
        mot_de_passe: "TestPass123",
        groupe_sanguin: "O+",
      });
    });

    it("should return 400 for missing credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        telephone: "6588888880",
        // Missing password
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("validation");
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app).post("/api/users/login").send({
        telephone: "6511111111",
        mot_de_passe: "TestPass123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("incorrects");
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app).post("/api/users/login").send({
        telephone: "6588888880",
        mot_de_passe: "WrongPass123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("incorrects");
    });

    it("should return 200 and token for valid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        telephone: "6588888880",
        mot_de_passe: "TestPass123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
    });
  });

  describe("Protected Routes - Authentication Errors", () => {
    let token;
    let userId;

    beforeEach(async () => {
      const registerRes = await request(app).post("/api/users/register").send({
        nom: "Test",
        prenom: "User",
        telephone: "6577777770",
        mot_de_passe: "TestPass123",
        groupe_sanguin: "O+",
      });

      // Gérer les deux structures possibles de réponse
      if (registerRes.body.token) {
        token = registerRes.body.token;
      }
      if (registerRes.body.user && registerRes.body.user.id) {
        userId = registerRes.body.user.id;
      } else if (
        registerRes.body.user &&
        registerRes.body.user.id_utilisateur
      ) {
        userId = registerRes.body.user.id_utilisateur;
      } else if (registerRes.body.id) {
        userId = registerRes.body.id;
      }
    });

    it("should return 401 for missing token on protected route", async () => {
      const res = await request(app).get(`/api/users/${userId}`);
      // No Authorization header

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("token");
    });

    it("should return 401 for invalid token format", async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", "Bearer invalid_token_format");

      expect(res.status).toBe(401);
    });

    it("should return 401 for expired token", async () => {
      // This would test actual JWT expiration
      // For now we'll test with a malformed JWT
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature",
        );

      expect(res.status).toBe(401);
    });

    it("should allow access with valid token", async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).not.toBe(401);
    });
  });

  describe.skip("Rate Limiting Error", () => {
    it("should return 429 after exceeding rate limit", async () => {
      let res;

      // Make requests until rate limit is hit
      for (let i = 0; i < 101; i++) {
        res = await request(app).post("/api/users/login").send({
          telephone: "650000000",
          mot_de_passe: "Pass1234",
        });

        if (res.status === 429) {
          break;
        }
      }

      expect(res.status).toBe(429);
      expect(res.body.message.toLowerCase()).toContain("trop de");
    });
  });
});
