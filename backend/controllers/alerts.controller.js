const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const LogNotification = db.LogNotification;
const { haversineSQL } = require("../utils/geoHelpers");
const { ErrorTypes } = require("../utils/errorHandler");
const alertService = require("../services/alert.service");
const cacheService = require("../services/cache.service");
const { notificationQueue } = require("../jobs/notification.queue");
const logger = require("../utils/logger");

exports.createAlert = async (req, res, next) => {
  try {
    const { alerte, isAutoValidated } = await alertService.createAlert(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: isAutoValidated ? "Alerte validée automatiquement !" : "Alerte créée et en attente de validation.",
      alerte,
      autoValidated: isAutoValidated,
    });
  } catch (error) {
    next(error);
  }
};

exports.createGuestAlert = async (req, res, next) => {
  try {
    const { alerte, isAutoValidated } = await alertService.createAlert(req.body, null);
    res.status(201).json({
      success: true,
      message: isAutoValidated ? "Urgence SOS validée automatiquement !" : "Alerte d'urgence créée !",
      alertId: alerte.id_alerte,
      autoValidated: isAutoValidated,
    });
  } catch (error) {
    next(error);
  }
};

exports.validateAndNotifyAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alerte = await alertService.validateAlert(id, req.user.id);
    res.status(202).json({ success: true, message: "Alerte validée.", alertId: alerte.id_alerte });
  } catch (error) {
    next(error);
  }
};

exports.getPendingAlerts = async (req, res, next) => {
  try {
    const alerts = await Alerte.findAll({
      where: { statut: "en_attente_validation" },
      include: [{ model: Utilisateur, as: "initiateur", attributes: ["nom", "prenom"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};

exports.getLiveAlerts = async (req, res, next) => {
  try {
    const alerts = await Alerte.findAll({
      where: { statut: "en_cours" },
      include: [{ model: Utilisateur, as: "initiateur", attributes: ["id_utilisateur", "nom", "prenom", "telephone"] }],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    res.json({
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id_alerte,
        public_token: a.public_token,
        groupe: a.groupe_requis,
        statut: a.statut,
        date: a.createdAt,
        lieu: a.lieu,
        latitude: a.latitude,
        longitude: a.longitude,
        urgence: a.degre_urgence,
        initiateur: a.initiateur ? `${a.initiateur.prenom} ${a.initiateur.nom}` : "Urgence SOS",
        telephone_initiateur: a.initiateur ? a.initiateur.telephone : a.telephone_contact,
        quantite_requise: a.quantite_requise,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyAlerts = async (req, res, next) => {
  try {
    const { lat, lng, latitude, longitude, radius } = req.query;
    
    // Support multiple param names (lat/lng vs latitude/longitude)
    const searchLat = lat || latitude;
    const searchLng = lng || longitude;

    if (!searchLat || !searchLng) {
      return res.status(400).json({ success: false, message: "Coordonnées (lat, lng) manquantes." });
    }

    const haversine = haversineSQL(parseFloat(searchLat), parseFloat(searchLng));
    const alerts = await Alerte.findAll({
      where: {
        statut: "en_cours",
        [db.Sequelize.Op.and]: db.sequelize.where(db.sequelize.literal(haversine), "<=", parseFloat(radius) || 50),
      },
      include: [{ model: Utilisateur, as: "initiateur", attributes: ["id_utilisateur", "nom", "prenom", "telephone"] }],
      attributes: { include: [[db.sequelize.literal(haversine), "distance"]] },
      order: db.sequelize.literal("distance ASC"),
      limit: 20,
    });
    res.json({
      success: true,
      alertes: alerts.map((a) => ({
        id: a.id_alerte,
        groupe: a.groupe_requis,
        statut: a.statut,
        date: a.createdAt,
        distance: a.getDataValue("distance"),
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlertStatus = async (req, res, next) => {
  try {
    const statusData = await alertService.getAlertStatus(req.params.id);
    res.json({ success: true, ...statusData });
  } catch (error) {
    next(error);
  }
};

exports.getUserAlerts = async (req, res, next) => {
  try {
    const alerts = await Alerte.findAll({
      where: { id_initiateur: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [{ model: LogNotification, as: "notifications" }],
    });
    res.json({
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id_alerte,
        public_token: a.public_token,
        groupe: a.groupe_requis,
        statut: a.statut,
        notifiedCount: a.notifications.length,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alerte = await Alerte.findByPk(req.params.id);
    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    if (alerte.id_initiateur !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Non autorisé à annuler cette alerte." });
    }
    alerte.statut = "annule";
    await alerte.save();
    await cacheService.del('api-cache:/api/alerts/public');
    res.json({ success: true, message: "Alerte annulée" });
  } catch (error) {
    next(error);
  }
};

exports.respondToAlert = async (req, res, next) => {
  try {
    await alertService.respondToAlert(req.params.id, req.user.id, req.body.response);
    res.json({ success: true, message: "Réponse enregistrée" });
  } catch (error) {
    next(error);
  }
};

exports.getAlertByToken = async (req, res, next) => {
  try {
    const data = await alertService.getAlertByPublicToken(req.params.token);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

exports.respondToAlertByToken = async (req, res, next) => {
  try {
    const { nom, telephone, reponse } = req.body;
    const alerte = await Alerte.findOne({ where: { public_token: req.params.token } });
    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    if (alerte.statut !== "en_cours") {
      return res.status(409).json({ success: false, message: "Cette alerte n'est plus active." });
    }
    // Crée une réponse invité dans LogNotification (id_utilisateur null)
    await LogNotification.create({
      id_alerte: alerte.id_alerte,
      id_utilisateur: null,
      statut_reception: reponse,
      nom_guest: nom,
      telephone_guest: telephone,
    });

    // Envoyer une push notification à l'initiateur si le donneur invité accepte
    let whatsappInitiateur = null;
    if (reponse === "accepte" && alerte.id_initiateur) {
      try {
        const initiator = await Utilisateur.findByPk(alerte.id_initiateur);
        if (initiator && initiator.push_token) {
          await notificationQueue.add("sendInitiatorNotification", {
            initiatorId: alerte.id_initiateur,
            alertId: alerte.id_alerte,
            donorName: `${nom} (invité)`,
            groupe: alerte.groupe_requis,
            message: `${nom} (invité) peut donner du sang. Son numéro : ${telephone}`,
            title: "Un donneur a répondu !",
          });
          logger.info("[respondToAlertByToken] Initiator notification enqueued", {
            alertId: alerte.id_alerte,
            initiatorId: alerte.id_initiateur,
          });
        }
        // Numéro WhatsApp de l'initiateur (chiffres seulement)
        const rawTel = alerte.telephone_contact || initiator?.telephone || "";
        whatsappInitiateur = rawTel.replace(/\D/g, "");
      } catch (err) {
        logger.error("[respondToAlertByToken] Failed to notify initiator", {
          alertId: alerte.id_alerte,
          initiatorId: alerte.id_initiateur,
          error: err.message,
        });
      }
    }

    // Créer un message système pour l'initiateur (donneur invité via lien)
    if (reponse === "accepte" && alerte.id_initiateur) {
      try {
        await db.Message.create({
          id_expediteur: alerte.id_initiateur,
          id_destinataire: alerte.id_initiateur,
          contenu: `[SYSTÈME] Un donneur via lien a répondu : ${nom}, ${telephone}. Contactez-le sur WhatsApp.`,
          est_lu: false,
        });
      } catch (err) {
        logger.error("[respondToAlertByToken] Failed to create system message", { error: err.message });
      }
    }

    res.json({
      success: true,
      message: reponse === "accepte" ? "Merci ! L'équipe va vous contacter." : "Réponse enregistrée.",
      ...(reponse === "accepte" && whatsappInitiateur ? { whatsapp_initiateur: whatsappInitiateur } : {}),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAcceptedAlerts = async (req, res, next) => {
  try {
    const notifications = await LogNotification.findAll({
      where: { id_utilisateur: req.user.id, statut_reception: "accepte" },
      include: [{ model: db.Alerte, as: "alerte", include: [{ model: db.Utilisateur, as: "initiateur", attributes: ["id_utilisateur", "nom", "prenom", "telephone"] }] }],
      order: [["date_envoi", "DESC"]],
    });
    const alertes = notifications.map(n => ({
      id: n.alerte.id_alerte,
      groupe: n.alerte.groupe_requis,
      lieu: n.alerte.lieu,
      urgence: n.alerte.degre_urgence,
      statut: n.alerte.statut,
      quantite_requise: n.alerte.quantite_requise,
      createdAt: n.alerte.createdAt,
      telephone_contact: n.alerte.telephone_contact,
      initiateur: n.alerte.initiateur ? { id: n.alerte.initiateur.id_utilisateur, nom: n.alerte.initiateur.nom, prenom: n.alerte.initiateur.prenom, telephone: n.alerte.initiateur.telephone } : null,
    }));
    res.json({ success: true, alertes });
  } catch (error) { next(error); }
};

exports.confirmDonation = async (req, res, next) => {
  try {
    const notification = await LogNotification.findOne({
      where: { id_alerte: req.params.id, id_utilisateur: req.user.id },
    });
    if (!notification) throw ErrorTypes.RESOURCE_NOT_FOUND("Interaction");

    notification.statut_reception = "don_effectue";
    await notification.save();

    // Enregistrer dans l'historique et mettre à jour le profil donneur
    const alerte = await db.Alerte.findByPk(req.params.id);
    await Promise.all([
      db.HistoriqueDon.create({
        id_donneur: req.user.id,
        id_centre: alerte?.id_centre ?? null,
        date_don: new Date(),
        statut_don: "réussi",
      }),
      db.ProfilDonneur.update(
        {
          dernier_don: new Date(),
          disponible: false,
        },
        { where: { id_donneur: req.user.id } }
      ),
    ]);

    res.json({ success: true, message: "Don enregistré. Merci !" });
  } catch (error) {
    next(error);
  }
};
