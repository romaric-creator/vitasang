const request = require("supertest");
const express = require("express");

// Mock dependencies
jest.mock("../../models", () => ({
  Centre: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  StockSang: {
    findAll: jest.fn(),
  },
  RendezVous: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
  Alerte: {
    count: jest.fn(),
  },
  HistoriqueDon: {
    count: jest.fn(),
  },
  Utilisateur: {
      findAll: jest.fn(),
  },
  sequelize: {
    literal: jest.fn(),
    where: jest.fn(),
    transaction: jest.fn(),
  },
  Sequelize: {
    Op: {
      and: Symbol("and"),
      or: Symbol("or"),
      gte: Symbol("gte"),
      lt: Symbol("lt"),
      ne: Symbol("ne"),
      between: Symbol("between"),
    },
  },
}));

// Mock Auth Middleware to bypass checks
jest.mock("../../utils/auth.middleware", () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, role: "personnel" };
    next();
  },
  requireRole: (role) => (req, res, next) => next(),
  isAdminOrPersonnel: (req, res, next) => next(),
  isAdmin: (req, res, next) => next(),
}));

jest.mock("../../middleware/cache", () => ({
  cacheMiddleware: () => (req, res, next) => next(),
}));

const db = require("../../models");
const centresRoute = require("../../routes/centres.routes");

describe("Dashboard Stats Integration Test", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/centres", centresRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/centres/:id/stats", () => {
    it("should return dashboard stats successfully", async () => {
      // Setup mocks
      db.StockSang.findAll.mockResolvedValue([
        { groupe_sanguin: "A+", quantite_poches: 10, seuil_alerte_min: 5 },
        { groupe_sanguin: "O-", quantite_poches: 2, seuil_alerte_min: 5 },
      ]);
      db.RendezVous.count.mockResolvedValue(5);
      db.Alerte.count.mockResolvedValue(2);
      db.HistoriqueDon.count.mockResolvedValue(15);

      const response = await request(app).get("/api/centres/1/stats");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalStock).toBe(12); // 10 + 2
      expect(response.body.stats.appointmentsToday).toBe(5);
      expect(response.body.stats.activeAlerts).toBe(2);
      expect(response.body.stats.donationsThisMonth).toBe(15);
    });

    it("should handle errors gracefully", async () => {
      db.StockSang.findAll.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/api/centres/1/stats");

      // Express default error handler might return HTML or JSON depending on setup.
      // But since we didn't mount error handler in this test app, it might crash or return 500 html.
      // However, usually it returns 500.
      expect(response.status).toBe(500);
    });
  });
});
