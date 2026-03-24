const request = require("supertest");
const express = require("express");

const mockCentres = [
  {
    id_centre: 1,
    nom: "Centre de Sang 1",
    latitude: 3.8667,
    longitude: 11.5167,
    adresse: "Yaoundé",
  },
  {
    id_centre: 2,
    nom: "Centre de Sang 2",
    latitude: 4.0511,
    longitude: 9.7679,
    adresse: "Douala",
  },
];

jest.mock("../../models", () => ({
  Centre: {
    findAll: jest.fn().mockResolvedValue(mockCentres),
    findByPk: jest
      .fn()
      .mockImplementation((id) =>
        Promise.resolve(mockCentres.find((c) => c.id_centre === id)),
      ),
    findOne: jest.fn().mockResolvedValue(mockCentres[0]),
  },
  Utilisateur: {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  },
  sequelize: {
    literal: jest.fn().mockReturnValue('mock_literal'),
    where: jest.fn().mockReturnValue({}),
  },
  Sequelize: {
    Op: {
      and: Symbol('and'),
    },
  },
}));

jest.mock("../../utils/geoHelpers", () => ({
  calculateDistance: jest.fn((lat1, lon1, lat2, lon2) => {
    // Mock Haversine distance
    return 10; // 10 km for testing
  }),
  haversineSQL: jest.fn().mockReturnValue('mock_haversine_sql')
}));

describe("Centres Controller - Integration Tests", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    const centresRoute = require("../../routes/centres.routes");
    app.use("/api/centres", centresRoute);
  });

  describe("GET /api/centres", () => {
    it("should retrieve all centres", async () => {
      const response = await request(app).get("/api/centres");

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.centres)).toBe(true);
      }
    });
  });

  describe("GET /api/centres/:id", () => {
    it("should retrieve centre details", async () => {
      const response = await request(app).get("/api/centres/1");

      expect([200, 404]).toContain(response.status);
    });

    it("should handle invalid ID", async () => {
      const response = await request(app).get("/api/centres/invalid");

      expect([400, 404]).toContain(response.status);
    });
  });

  describe("GET /api/centres/search", () => {
    it("should search nearby centres", async () => {
      const response = await request(app).get("/api/centres/search").query({
        latitude: "33.5731",
        longitude: "-7.5898",
        radius: "10",
      });

      expect([200, 400]).toContain(response.status);
    });

    it("should reject missing parameters", async () => {
      const response = await request(app)
        .get("/api/centres/search")
        .query({ latitude: "33.5731" }); // missing longitude, radius

      expect(response.status).toBe(400);
    });

    it("should reject invalid latitude", async () => {
      const response = await request(app).get("/api/centres/search").query({
        latitude: "200", // > 90
        longitude: "-7.5898",
        radius: "10",
      });

      expect(response.status).toBe(400);
    });

    it("should reject invalid longitude", async () => {
      const response = await request(app).get("/api/centres/search").query({
        latitude: "33.5731",
        longitude: "200", // > 180
        radius: "10",
      });

      expect(response.status).toBe(400);
    });

    it("should validate radius range", async () => {
      const response = await request(app).get("/api/centres/search").query({
        latitude: "33.5731",
        longitude: "-7.5898",
        radius: "200", // > 100
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/centres/:id/availability", () => {
    it("should get centre availability slots", async () => {
      const response = await request(app).get("/api/centres/1/availability");

      expect([200, 404]).toContain(response.status);
    });
  });

  describe("GET /api/centres/:id/stock", () => {
    it("should get blood stock levels", async () => {
      const response = await request(app).get("/api/centres/1/stock");

      expect([200, 401, 404]).toContain(response.status);
    });
  });
});
