const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const LogNotification = db.LogNotification;
const logger = require("../config/logger");
const { haversineSQL } = require("../utils/geoHelpers");
const { ErrorTypes } = require("../utils/errorHandler");
const alertService = require("../services/alert.service");

// --- CREATE ALERT ---
exports.createAlert = async (req, res, next) => {
  try {
    const { alerte, isAutoValidated } = await alertService.createAlert(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: isAutoValidated
        ? "Alerte validée automatiquement grâce à votre proximité avec un hôpital !"
        : "Alerte créée et en attente de validation.",
      alerte,
      autoValidated: isAutoValidated,
    });
  } catch (error) {
    next(error);
  }
};

// --- CREATE GUEST ALERT ---
exports.createGuestAlert = async (req, res, next) => {
  try {
    const { alerte, isAutoValidated } = await alertService.createAlert(
      req.body,
      null // initiatorId is null for guest
    );

    res.status(201).json({
      success: true,
      message: isAutoValidated
        ? "Urgence SOS validée automatiquement ! Les donneurs sont en cours de notification."
        : "Alerte d'urgence créée ! Un agent va la valider très rapidement.",
      alertId: alerte.id_alerte,
      autoValidated: isAutoValidated,
    });
  } catch (error) {
    next(error);
  }
};

// --- VALIDATE AND NOTIFY ---
exports.validateAndNotifyAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatorId = req.user.id;

    const alerte = await alertService.validateAlert(id, validatorId);

    res.status(202).json({
      success: true,
      message: "Alerte validée. Les notifications sont en cours d'envoi.",
      alertId: alerte.id_alerte,
    });
  } catch (error) {
    next(error);
  }
};

// --- READ OPERATIONS --- (Restent dans le contrôleur car simples SELECT)

exports.getPendingAlerts = async (req, res, next) => {
  try {
    const alerts = await Alerte.findAll({
      where: { statut: "en_attente_validation" },
      include: [
        { model: Utilisateur, as: "initiateur", attributes: ["nom", "prenom"] },
      ],
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
      include: [
        {
          model: Utilisateur,
          as: "initiateur",
          attributes: ["id_utilisateur", "nom", "prenom", "telephone"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id_alerte,
        groupe: a.groupe_requis,
        statut: a.statut,
        date: a.createdAt,
        lieu: a.lieu,
        latitude: a.latitude,
        longitude: a.longitude,
        urgence: a.degre_urgence,
        initiateur: a.initiateur
          ? `${a.initiateur.prenom} ${a.initiateur.nom}`
          : a.nom_patient || "Urgence SOS",
        telephone_initiateur: a.initiateur
          ? a.initiateur.telephone
          : a.telephone_contact,
        quantite_requise: a.quantite_requise,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyAlerts = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    const searchRadius = parseFloat(radius) || 50;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const haversine = haversineSQL(userLat, userLng);

    const alerts = await Alerte.findAll({
      where: {
        statut: "en_cours",
        [db.Sequelize.Op.and]: db.sequelize.where(
          db.sequelize.literal(haversine),
          "<=",
          searchRadius,
        ),
      },
      include: [
        {
          model: Utilisateur,
          as: "initiateur",
          attributes: ["id_utilisateur", "nom", "prenom", "telephone"],
        },
      ],
      attributes: {
        include: [[db.sequelize.literal(haversine), "distance"]],
      },
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
        lieu: a.lieu,
        latitude: a.latitude,
        longitude: a.longitude,
        urgence: a.degre_urgence,
        initiateur: a.initiateur
          ? `${a.initiateur.prenom} ${a.initiateur.nom}`
          : a.nom_patient || "Urgence SOS",
        telephone_initiateur: a.initiateur
          ? a.initiateur.telephone
          : a.telephone_contact,
        quantite_requise: a.quantite_requise,
        distance: a.getDataValue("distance"),
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlertStatus = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user ? Number(req.user.id) : null;
  const userRole = req.user ? req.user.role : null;

  try {
    const alerte = await Alerte.findByPk(id, {
      include: [
        {
          model: LogNotification,
          as: "notifications",
          include: [
            {
              model: Utilisateur,
              as: "destinataire",
              attributes: ["nom", "prenom", "telephone"],
            },
          ],
        },
        {
          model: Utilisateur,
          as: "initiateur",
          attributes: ["id_utilisateur", "nom", "prenom", "telephone"],
        },
      ],
    });

    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");

    // Autorisations (simplifiées ici pour la clarté)
    const canAccess = alerte.id_initiateur === null || 
                      (userId && alerte.id_initiateur === userId) || 
                      userRole === "admin" || 
                      alerte.statut === "en_cours";

    if (!canAccess) throw ErrorTypes.UNAUTHORIZED_ACCESS();

    const stats = {
      total: alerte.notifications.length,
      envoye: alerte.notifications.filter(n => n.statut_reception === "envoye").length,
      lu: alerte.notifications.filter(n => n.statut_reception === "lu").length,
      accepte: alerte.notifications.filter(n => n.statut_reception === "accepte").length,
      ignore: alerte.notifications.filter(n => n.statut_reception === "ignore").length,
    };

    res.json({
      success: true,
      alerte: {
        id: alerte.id_alerte,
        groupe: alerte.groupe_requis,
        statut: alerte.statut,
        lieu: alerte.lieu,
        latitude: alerte.latitude,
        longitude: alerte.longitude,
        urgence: alerte.degre_urgence,
        createdAt: alerte.createdAt,
        initiateur: alerte.initiateur
          ? {
              id_utilisateur: alerte.initiateur.id_utilisateur,
              nom: alerte.initiateur.nom,
              prenom: alerte.initiateur.prenom,
              telephone: alerte.initiateur.telephone,
            }
          : {
              nom: alerte.nom_patient || "Patient",
              prenom: "Urgence",
              telephone: alerte.telephone_contact,
            },
      },
      stats,
      details: (userId === alerte.id_initiateur || userRole === "admin")
          ? alerte.notifications.map(n => ({
              donneur: `${n.destinataire.prenom} ${n.destinataire.nom}`,
              statut: n.statut_reception,
              telephone: n.destinataire.telephone,
            }))
          : [],
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserAlerts = async (req, res, next) => {
  try {
    const id_utilisateur = req.user.id;
    const alerts = await Alerte.findAll({
      where: { id_initiateur: id_utilisateur },
      order: [["createdAt", "DESC"]],
      include: [
        { model: LogNotification, as: "notifications" },
        { model: Utilisateur, as: "initiateur", attributes: ["telephone"] },
      ],
    });
    res.json({
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id_alerte,
        groupe: a.groupe_requis,
        statut: a.statut,
        date: a.createdAt,
        notifiedCount: a.notifications.length,
        acceptedCount: a.notifications.filter(n => n.statut_reception === "accepte").length,
        urgence: a.degre_urgence,
        lieu: a.lieu,
        telephone_initiateur: a.initiateur ? a.initiateur.telephone : a.telephone_contact,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alerte = await Alerte.findByPk(id);
    if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");

    if (alerte.id_initiateur !== req.user.id && req.user.role !== "admin") {
      throw ErrorTypes.UNAUTHORIZED_ACCESS();
    }

    alerte.statut = "annule";
    await alerte.save();
    res.json({ success: true, message: "Alerte annulée avec succès" });
  } catch (error) {
    next(error);
  }
};

exports.respondToAlert = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    let notification = await LogNotification.findOne({
      where: { id_alerte: id, id_utilisateur: userId },
      transaction,
    });

    if (!notification) {
      notification = await LogNotification.create({
        id_alerte: id,
        id_utilisateur: userId,
        statut_reception: response,
      }, { transaction });
    } else {
      notification.statut_reception = response;
      await notification.save({ transaction });
    }

    if (response === "accepte") {
      const alerte = await Alerte.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (alerte && alerte.statut === "en_cours") {
        const acceptedCount = await LogNotification.count({
          where: { id_alerte: id, statut_reception: "accepte" },
          transaction,
        });

        if (acceptedCount >= alerte.quantite_requise) {
          alerte.statut = "resolu";
          await alerte.save({ transaction });
        }
      }
    }

    await transaction.commit();
    res.json({ success: true, message: "Réponse enregistrée" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};
