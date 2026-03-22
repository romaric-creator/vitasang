const { describe, it, expect, beforeEach, afterEach } = require("@jest/globals");

// Mocks
jest.mock("../../utils/expoNotifications", () => ({
  buildPushMessage: jest.fn(({ to, title, body, data }) => ({ to, title, body, data })),
  sendPushNotifications: jest.fn().mockImplementation((messages) => 
    Promise.resolve({ successful: messages.map(m => m.to), failed: [] })
  ),
}));

const db = require("../../models");
const expoNotifications = require("../../utils/expoNotifications");
const notificationProcessor = require("../../jobs/notification.processor");

describe("Notification Processor Unit Tests", () => {
  let mockUtilisateur;
  let mockProfilDonneur;
  let mockLogNotification;

  beforeEach(() => {
    mockUtilisateur = db.Utilisateur;
    mockProfilDonneur = db.ProfilDonneur;
    mockLogNotification = db.LogNotification;

    // Mocks Sequelize
    mockUtilisateur.findAll = jest.fn();
    mockUtilisateur.findByPk = jest.fn();
    mockLogNotification.bulkCreate = jest.fn().mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should process campaign notifications correctly", async () => {
    const job = {
      name: "sendCampaignNotification",
      data: {
        donneurId: 1,
        titre: "Campagne Test",
        message: "Message de test",
        centreId: 10,
      }
    };

    mockUtilisateur.findByPk.mockResolvedValue({
      id_utilisateur: 1,
      push_token: "token1"
    });

    const result = await notificationProcessor(job);

    expect(result).toEqual({ processed: 1 });
    expect(expoNotifications.buildPushMessage).toHaveBeenCalledWith(expect.objectContaining({
      to: "token1",
      title: "Campagne Test",
      data: { type: "campaign", centreId: 10 }
    }));
    expect(expoNotifications.sendPushNotifications).toHaveBeenCalled();
  });

  it("should process emergency alerts correctly and find compatible donors", async () => {
    const job = {
      name: "sendAlert",
      data: {
        alertId: 101,
        groupe_requis: "O+",
        latitude: 4.05,
        longitude: 9.7,
        rayon_action_km: 10,
        degre_urgence: "URGENT",
      }
    };

    // Mock des donneurs compatibles trouvés par haversine + groupe sanguin
    mockUtilisateur.findAll.mockResolvedValue([
      {
        id_utilisateur: 5,
        push_token: "token_donor_5",
        telephone: "677000000",
        dataValues: { distance: 2.5 }
      }
    ]);

    const result = await notificationProcessor(job);

    expect(result).toEqual({ processed: 1 });
    expect(mockUtilisateur.findAll).toHaveBeenCalled();
    expect(expoNotifications.sendPushNotifications).toHaveBeenCalled();
    expect(mockLogNotification.bulkCreate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        id_utilisateur: 5,
        id_alerte: 101,
        canal: "push"
      })
    ]));
  });

  it("should handle the case where no donors are found", async () => {
    const job = {
      name: "sendAlert",
      data: {
        alertId: 102,
        groupe_requis: "AB-",
        latitude: 4.05,
        longitude: 9.7,
        rayon_action_km: 5,
      }
    };

    mockUtilisateur.findAll.mockResolvedValue([]);

    const result = await notificationProcessor(job);

    expect(result).toEqual({ processed: 0 });
    expect(expoNotifications.sendPushNotifications).not.toHaveBeenCalled();
    expect(mockLogNotification.bulkCreate).not.toHaveBeenCalled();
  });
});
