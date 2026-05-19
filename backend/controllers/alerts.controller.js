const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const LogNotification = db.LogNotification;
const { haversineSQL } = require("../utils/geoHelpers");
const { ErrorTypes } = require("../utils/errorHandler");
const alertService = require("../services/alert.service");

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
    alerte.statut = "annule";
    await alerte.save();
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

exports.confirmDonation = async (req, res, next) => {
  try {
    const notification = await LogNotification.findOne({ where: { id_alerte: req.params.id, id_utilisateur: req.user.id } });
    if (!notification) throw ErrorTypes.RESOURCE_NOT_FOUND("Interaction");
    notification.statut_reception = "don_effectue";
    await notification.save();
    res.json({ success: true, message: "Merci !" });
  } catch (error) {
    next(error);
  }
};
