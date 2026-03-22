const db = require("../models");
const logger = require("../config/logger");
const expoNotifications = require("../utils/expoNotifications");
const { haversineSQL, getBoundingBox } = require("../utils/geoHelpers");
const { BLOOD_COMPATIBILITY } = require("../utils/bloodCompatibility");

// Réels canaux de communication (Interface d'implémentation)
const deliveryService = {
  sendWhatsApp: async (phone, message) => {
    logger.info(`[WhatsApp SOS] Tentative d'envoi à ${phone}`);
    return { success: true, service: "mock" };
  },
  sendSMS: async (phone, message) => {
    logger.info(`[SMS SOS] Tentative d'envoi à ${phone}`);
    return { success: true, service: "mock" };
  }
};

/**
 * @description Processeur principal pour les notifications BullMQ.
 * @param {object} job - Le job BullMQ contenant les données.
 */
const notificationProcessor = async (job) => {
  const Utilisateur = db.Utilisateur;
  const ProfilDonneur = db.ProfilDonneur;
  const LogNotification = db.LogNotification;
  const startTime = Date.now();

  // 1. GESTION DES CAMPAGNES
  if (job.name === "sendCampaignNotification") {
    const { donneurId, titre, message, centreId } = job.data;
    const donor = await Utilisateur.findByPk(donneurId);
    if (donor && donor.push_token) {
      const pushMessage = expoNotifications.buildPushMessage({
        to: donor.push_token,
        title: titre,
        body: message,
        data: { type: "campaign", centreId },
      });
      await expoNotifications.sendPushNotifications([pushMessage]);
    }
    return { processed: 1 };
  }

  // 2. GESTION DES MESSAGES PRIVES
  if (job.name === "sendMessageNotification") {
    const { senderId, recipientId, contenu, senderName } = job.data;
    const recipient = await Utilisateur.findByPk(recipientId);
    if (recipient && recipient.push_token) {
      const pushMessage = expoNotifications.buildPushMessage({
        to: recipient.push_token,
        title: `Message de ${senderName}`,
        body: contenu,
        data: { type: "message", senderId },
      });
      await expoNotifications.sendPushNotifications([pushMessage]);
    }
    return { processed: 1 };
  }

  // 3. GESTION DES ALERTES D'URGENCE (Par défaut)
  const {
    alertId,
    groupe_requis,
    latitude,
    longitude,
    rayon_action_km,
    degre_urgence,
  } = job.data;

  // Logique Mode Nuit (Désactivée en DEV/TEST)
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 22 || currentHour < 7;
  const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!isDevOrTest && isNight && degre_urgence !== "TRES_URGENT") {
    logger.info(`Mode nuit actif. Notification différée pour l'alerte ${alertId}`);
    return { skipped: "night_mode" };
  }

  logger.info("Processing emergency notifications", { alertId, degre_urgence });

  // --- OPTIMISATION : BOUNDING BOX ---
  // On calcule un carré autour de l'alerte pour pré-filtrer massivement en SQL
  // C'est 100x plus rapide qu'un calcul de distance complexe sur chaque ligne.
  const bbox = getBoundingBox(latitude, longitude, rayon_action_km);
  
  const haversine = haversineSQL(latitude, longitude, "profilDonneur", "lat_actuelle", "long_actuelle");

  const compatibleGroups = groupe_requis === "INCONNU"
    ? ["O-"]
    : Object.keys(BLOOD_COMPATIBILITY).filter((group) =>
        BLOOD_COMPATIBILITY[group].includes(groupe_requis),
      );

  const donors = await Utilisateur.findAll({
    where: { role: "donneur" },
    include: [
      {
        model: ProfilDonneur,
        as: "profilDonneur",
        where: {
          groupe_sanguin: compatibleGroups,
          disponible: true,
          // 1. PRÉ-FILTRAGE RAPIDE (Comparaison de nombres, utilise les index SQL)
          lat_actuelle: { [db.Sequelize.Op.between]: [bbox.minLat, bbox.maxLat] },
          long_actuelle: { [db.Sequelize.Op.between]: [bbox.minLon, bbox.maxLon] },
          // 2. FILTRAGE PRÉCIS (Calcul trigonométrique uniquement sur les survivants)
          [db.Sequelize.Op.and]: db.sequelize.where(db.sequelize.literal(haversine), "<=", rayon_action_km),
        },
        required: true,
      },
    ],
    attributes: {
      include: [[db.sequelize.literal(haversine), "distance"]],
    },
  });

  const duration = Date.now() - startTime;
  logger.info(`Found ${donors.length} compatible donors in ${duration}ms`, { alertId });

  const logsToCreate = [];
  const pushMessages = [];
  const donorMap = new Map();

  for (const donor of donors) {
    const distance = parseFloat(donor.dataValues.distance).toFixed(2);
    const messageText = `Besoin urgent de sang ${groupe_requis} à seulement ${distance} km de vous.`;

    if (donor.push_token) {
      pushMessages.push(expoNotifications.buildPushMessage({
        to: donor.push_token,
        title: "Urgence Don de Sang",
        body: messageText,
        data: { alertId, groupe_sanguin: groupe_requis, distance },
      }));
      donorMap.set(donor.push_token, { donor, distance, messageText });
    }
  }

  if (pushMessages.length > 0) {
    const { successful } = await expoNotifications.sendPushNotifications(pushMessages);
    successful.forEach((token) => {
      const info = donorMap.get(token);
      if (info) {
        logsToCreate.push({
          id_utilisateur: info.donor.id_utilisateur,
          id_alerte: alertId,
          canal: "push",
          statut_reception: "reçu",
          push_token: token,
        });
      }
    });
  }

  if (logsToCreate.length > 0) {
    await LogNotification.bulkCreate(logsToCreate);
  }

  return { processed: donors.length };
};

module.exports = notificationProcessor;
