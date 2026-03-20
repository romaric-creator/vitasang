const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const LogNotification = db.LogNotification;
const logger = require("../config/logger");
const { calculateDistance, haversineSQL } = require("../utils/geoHelpers");
const expoNotifications = require("../utils/expoNotifications");
const { ErrorTypes } = require("../utils/errorHandler");
const { notificationQueue } = require("../jobs/notification.queue");

/**
 * Tente de valider automatiquement une alerte si elle est proche d'un centre.
 * @param {object} alerte L'instance de l'alerte Sequelize
 */
const attemptAutoValidation = async (alerte) => {
  const { latitude, longitude, id_alerte, groupe_requis, rayon_action_km } = alerte;

  const haversine = haversineSQL(latitude, longitude);
  const [centresProches] = await db.sequelize.query(`
    SELECT id_centre, nom_centre, ${haversine} AS distance
    FROM Centres_Sante
    HAVING distance <= 2
    ORDER BY distance ASC
    LIMIT 1
  `);

  if (centresProches.length > 0) {
    logger.info("Auto-validating alert (proximity to center)", {
      alertId: id_alerte,
      centerId: centresProches[0].id_centre,
      distance: centresProches[0].distance
    });

    alerte.statut = "en_cours";
    alerte.id_centre = centresProches[0].id_centre;
    await alerte.save();

    // Déposer immédiatement dans la file d'attente
    await notificationQueue.add("sendAlert", {
      alertId: id_alerte,
      groupe_requis,
      latitude,
      longitude,
      rayon_action_km,
      validatorId: null // Auto-validated
    });

    return true;
  }
  return false;
};

const bloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

// Step 1: Just create the alert with a pending status
exports.createAlert = async (req, res, next) => {
  const {
    latitude,
    longitude,
    groupe_sanguin,
    radius,
    urgence,
    quantite_requise,
    lieu,
    description,
  } = req.body;
  const id_initiateur = req.user.id;

  try {
    logger.info("Creating alert (pending validation)", {
      userId: id_initiateur,
      groupe_sanguin,
    });

    const alerte = await Alerte.create({
      groupe_requis: groupe_sanguin,
      degre_urgence: urgence || "NORMAL",
      rayon_action_km: radius || 10,
      id_initiateur: id_initiateur,
      latitude,
      longitude,
      lieu,
      description,
      quantite_requise: quantite_requise || 1,
      statut: "en_attente_validation", // New default status
    });

    logger.info("Alert created, checking for auto-validation", {
      alertId: alerte.id_alerte,
    });

    const isAutoValidated = await attemptAutoValidation(alerte);

    res.status(201).json({
      success: true,
      message: isAutoValidated
        ? "Alerte validée automatiquement grâce à votre proximité avec un hôpital !"
        : "Alerte créée et en attente de validation.",
      alerte,
      autoValidated: isAutoValidated
    });
  } catch (error) {
    logger.error("Error creating alert", {
      error: error.message,
      userId: id_initiateur,
    });
    next(error);
  }
};

exports.createGuestAlert = async (req, res, next) => {
  const {
    latitude,
    longitude,
    groupe_sanguin,
    lieu,
    description,
    nom_patient,
    telephone_contact,
  } = req.body;

  try {
    logger.info("Creating GUEST alert", { nom_patient, groupe_sanguin });

    const alerte = await Alerte.create({
      groupe_requis: groupe_sanguin,
      degre_urgence: "URGENT", // Guest alerts are usually urgent
      rayon_action_km: 15,    // Default radius for guests
      id_initiateur: null,    // Explicitly null for guest
      latitude,
      longitude,
      lieu,
      description: description || `Urgence pour ${nom_patient}`,
      nom_patient,
      telephone_contact,
      statut: "en_attente_validation",
    });

    logger.info("Guest alert created, checking for auto-validation", {
      alertId: alerte.id_alerte,
    });

    const isAutoValidated = await attemptAutoValidation(alerte);

    res.status(201).json({
      success: true,
      message: isAutoValidated
        ? "Urgence SOS validée automatiquement ! Les donneurs sont en cours de notification."
        : "Alerte d'urgence créée ! Un agent va la valider très rapidement.",
      alertId: alerte.id_alerte,
      autoValidated: isAutoValidated
    });
  } catch (error) {
    logger.error("Error creating guest alert", { error: error.message });
    next(error);
  }
};

// Step 2: Validate the alert and send notifications
exports.validateAndNotifyAlert = async (req, res, next) => {
  const { id } = req.params;
  const validatorId = req.user.id;

  try {
    const alerte = await Alerte.findByPk(id);
    if (!alerte) {
      throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    }

    if (alerte.statut !== "en_attente_validation") {
      throw ErrorTypes.BAD_REQUEST(
        `L'alerte a déjà été traitée (statut: ${alerte.statut}).`,
      );
    }

    alerte.statut = "en_cours";
    await alerte.save();

    logger.info("Alert validated, now notifying donors", {
      alertId: alerte.id_alerte,
      validatorId,
    });

    const { groupe_requis, latitude, longitude, rayon_action_km } = alerte;

    // Déposer la tâche de notification dans la file d'attente BullMQ
    await notificationQueue.add("sendAlert", {
      alertId: alerte.id_alerte,
      groupe_requis,
      latitude,
      longitude,
      rayon_action_km,
      validatorId
    });

    res.status(202).json({
      success: true,
      message: "Alerte validée. Les notifications sont en cours d'envoi.",
      alertId: alerte.id_alerte,
    });
  } catch (error) {
    logger.error("Error validating alert", {
      error: error.message,
      alertId: id,
    });
    next(error);
  }
};

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
    logger.error("Error fetching pending alerts", { error: error.message });
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
          attributes: ["nom", "prenom", "telephone"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      alerts: alerts
        .filter((a) => a.initiateur !== null) // Filtre les alertes sans utilisateur
        .map((a) => ({
          id: a.id_alerte,
          groupe: a.groupe_requis,
          statut: a.statut,
          date: a.createdAt,
          lieu: a.lieu,
          urgence: a.degre_urgence,
          initiateur: `${a.initiateur.prenom} ${a.initiateur.nom}`,
          telephone_initiateur: a.initiateur.telephone,
          quantite_requise: a.quantite_requise,
        })),
    });
  } catch (error) {
    logger.error("Error fetching live alerts", { error: error.message });
    next(error);
  }
};

exports.getAlertStatus = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

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
          attributes: ["nom", "prenom", "telephone"],
        },
      ],
    });

    if (!alerte) {
      throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    }

    const isInitiator = alerte.id_initiateur === userId;
    const isAdmin = userRole === "admin";
    const isNotified = alerte.notifications.some(
      (n) => n.id_utilisateur === userId,
    );

    if (!isInitiator && !isAdmin && !isNotified) {
      throw ErrorTypes.UNAUTHORIZED_ACCESS();
    }

    const stats = {
      total: alerte.notifications.length,
      envoye: alerte.notifications.filter(
        (n) => n.statut_reception === "envoye",
      ).length,
      lu: alerte.notifications.filter((n) => n.statut_reception === "lu")
        .length,
      accepte: alerte.notifications.filter(
        (n) => n.statut_reception === "accepte",
      ).length,
      ignore: alerte.notifications.filter(
        (n) => n.statut_reception === "ignore",
      ).length,
    };

    res.json({
      success: true,
      alerte: {
        id: alerte.id_alerte,
        groupe: alerte.groupe_requis,
        statut: alerte.statut,
        lieu: alerte.lieu,
        description: alerte.description,
        createdAt: alerte.createdAt,
        initiateur: {
          nom: alerte.initiateur.nom,
          prenom: alerte.initiateur.prenom,
          telephone: alerte.initiateur.telephone,
        },
      },
      stats,
      details:
        isInitiator || isAdmin
          ? alerte.notifications.map((n) => ({
            donneur: `${n.destinataire.prenom} ${n.destinataire.nom}`,
            statut: n.statut_reception,
            telephone: n.destinataire.telephone,
          }))
          : [],
    });
  } catch (error) {
    logger.error("Erreur récup statut alerte:", {
      error: error.message,
      alertId: req.params.id,
    });
    next(error);
  }
};

exports.getUserAlerts = async (req, res, next) => {
  const id_utilisateur = req.user.id;
  try {
    const alerts = await Alerte.findAll({
      where: { id_initiateur: id_utilisateur },
      order: [["createdAt", "DESC"]],
      include: [{ model: LogNotification, as: "notifications" }],
    });
    res.json({
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id_alerte,
        groupe: a.groupe_requis,
        statut: a.statut,
        date: a.createdAt,
        notifiedCount: a.notifications.length,
        acceptedCount: a.notifications.filter(
          (n) => n.statut_reception === "accepte",
        ).length,
      })),
    });
  } catch (error) {
    logger.error("Erreur récup alertes utilisateur:", {
      error: error.message,
      userId: id_utilisateur,
    });
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const alerte = await Alerte.findByPk(id);
    if (!alerte) {
      throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    }
    if (alerte.id_initiateur !== userId) {
      throw ErrorTypes.UNAUTHORIZED_ACCESS(
        "Vous ne pouvez annuler que vos propres alertes",
      );
    }
    alerte.statut = "annule";
    await alerte.save();
    res
      .status(200)
      .json({ success: true, message: "Alerte annulée avec succès" });
  } catch (error) {
    logger.error("Erreur lors de l'annulation de l'alerte:", {
      error: error.message,
      alertId: req.params.id,
    });
    next(error);
  }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, ...otherFields } = req.body;
    const userId = req.user.id;

    const alerte = await Alerte.findByPk(id);
    if (!alerte) {
      throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
    }

    // Allow admin or initiator to update
    if (alerte.id_initiateur !== userId && req.user.role !== "admin") {
      throw ErrorTypes.UNAUTHORIZED_ACCESS(
        "Vous ne pouvez mettre à jour que vos propres alertes",
      );
    }

    const validStatuses = [
      "en_attente_validation",
      "en_cours",
      "resolu",
      "annule",
    ];
    if (statut && !validStatuses.includes(statut)) {
      throw ErrorTypes.BAD_REQUEST(
        `Le statut doit être l'un de: ${validStatuses.join(", ")}`,
      );
    }

    // Only allow status changes through dedicated endpoints, except for cancellation
    if (
      statut &&
      statut !== "annule" &&
      alerte.statut === "en_attente_validation"
    ) {
      // use validate endpoint instead
      throw ErrorTypes.BAD_REQUEST(
        `Pour valider une alerte, utilisez le point de terminaison de validation.`,
      );
    }

    Object.assign(alerte, otherFields);
    if (statut) alerte.statut = statut;

    await alerte.save();

    res.status(200).json({
      success: true,
      message: "Alerte mise à jour avec succès",
      alerte,
    });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour de l'alerte:", {
      error: error.message,
      alertId: req.params.id,
    });
    next(error);
  }
};

exports.respondToAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    if (!["accepte", "ignore"].includes(response)) {
      throw ErrorTypes.VALIDATION_ERROR(
        "Réponse invalide. Utilisez 'accepte' ou 'ignore'.",
      );
    }

    const notification = await LogNotification.findOne({
      where: { id_alerte: id, id_utilisateur: userId },
    });
    if (!notification) {
      throw ErrorTypes.NOT_FOUND("Vous n'êtes pas concerné par cette alerte.");
    }

    notification.statut_reception = response;
    await notification.save();

    logger.info("User responded to alert", { userId, alertId: id, response });

    res.json({
      success: true,
      message:
        response === "accepte"
          ? "Merci pour votre engagement !"
          : "Réponse enregistrée",
      statut: notification.statut_reception,
    });
  } catch (error) {
    logger.error("Error responding to alert", {
      error: error.message,
      userId: req.user.id,
      alertId: req.params.id,
    });
    next(error);
  }
};

exports.getAcceptedAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const acceptedNotifications = await LogNotification.findAll({
      where: { id_utilisateur: userId, statut_reception: "accepte" },
      include: [
        {
          model: Alerte,
          as: "alerte",
          include: [
            {
              model: Utilisateur,
              as: "initiateur",
              attributes: ["nom", "prenom", "telephone"],
            },
          ],
        },
      ],
      order: [["date_envoi", "DESC"]],
    });

    res.json({
      success: true,
      alerts: acceptedNotifications.map((n) => ({
        id: n.alerte.id_alerte,
        groupe: n.alerte.groupe_requis,
        statut: n.alerte.statut,
        date: n.alerte.createdAt,
        lieu: n.alerte.lieu,
        initiateur: `${n.alerte.initiateur.prenom} ${n.alerte.initiateur.nom}`,
        telephone_initiateur: n.alerte.initiateur.telephone,
      })),
    });
  } catch (error) {
    logger.error("Error fetching accepted alerts", { error: error.message });
    next(error);
  }
};
