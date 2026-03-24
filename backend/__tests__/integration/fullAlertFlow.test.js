const request = require("supertest");
const app = require("../../index");
const db = require("../../models");

jest.setTimeout(30000); // Augmenter le timeout global pour ce test

describe("🔥 Flux Complet : Alerte SOS et Confirmation de Don", () => {
  let tokenA, tokenB, alertId;
  const userA = {
    nom: "Demandeur",
    prenom: "Test",
    telephone: "699000001",
    mot_de_passe: "Password123",
    role: "donneur",
  };

  const userB = {
    nom: "Donneur",
    prenom: "Hero",
    telephone: "699000002",
    mot_de_passe: "Password123",
    role: "donneur",
  };

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("1. Inscription et Connexion des utilisateurs A et B", async () => {
    await request(app).post("/api/users/register").send(userA);
    const resA = await request(app).post("/api/users/login").send({
      telephone: userA.telephone,
      mot_de_passe: userA.mot_de_passe,
    });
    tokenA = resA.body.token;

    await request(app).post("/api/users/register").send(userB);
    const resB = await request(app).post("/api/users/login").send({
      telephone: userB.telephone,
      mot_de_passe: userB.mot_de_passe,
    });
    tokenB = resB.body.token;

    expect(tokenA).toBeDefined();
    expect(tokenB).toBeDefined();
  });

  test("2. Utilisateur A lance une alerte urgente B+", async () => {
    const alertData = {
      groupe_sanguin: "B+",
      urgence: "URGENT",
      quantite_requise: 1,
      lieu: "Hôpital de Test",
      latitude: 4.0511,
      longitude: 9.7679,
      telephone_contact: userA.telephone,
    };

    const res = await request(app)
      .post("/api/alerts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(alertData);

    expect(res.status).toBe(201);
    alertId = res.body.alerte.id_alerte;
    
    // Forcer le statut en cours pour le test
    const alerte = await db.Alerte.findByPk(alertId);
    alerte.statut = "en_cours";
    await alerte.save();
  });

  test("3. Utilisateur B consulte les alertes publiques", async () => {
    const res = await request(app).get("/api/alerts/public");
    expect(res.status).toBe(200);
    const alerts = res.body.alerts;
    const foundAlert = alerts.find((a) => a.id === alertId);
    expect(foundAlert).toBeDefined();
  });

  test("4. Utilisateur B accepte l'alerte", async () => {
    const res = await request(app)
      .post(`/api/alerts/${alertId}/respond`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ response: "accepte" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 15000); // Timeout spécifique pour l'acceptation

  test("5. Utilisateur B confirme le don", async () => {
    const res = await request(app)
      .post(`/api/alerts/${alertId}/confirm`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("6. Utilisateur A vérifie le statut final", async () => {
    const res = await request(app)
      .get(`/api/alerts/${alertId}/status`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const donorRecord = res.body.details.find((d) => d.statut === "don_effectue");
    expect(donorRecord).toBeDefined();
    expect(donorRecord.donneur).toContain("Hero");
  });
});
