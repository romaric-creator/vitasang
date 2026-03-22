const db = require("../models");
const logger = require("../config/logger");
const expoNotifications = require("../utils/expoNotifications");
const { haversineSQL } = require("../utils/geoHelpers");

let notificationQueue = { add: async () => {} };

if (process.env.NODE_ENV !== "test") {
  const { Queue, Worker } = require("bullmq");
  const IORedis = require("ioredis");

  const connection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    },
  );

  connection.on("error", (err) => {
    logger.error("Redis Connection Error:", err.message);
  });

  notificationQueue = new Queue("notifications", {
    connection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 1000,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    },
  });

  // Réels canaux de communication (Interface d'implémentation)
  const deliveryService = {
    sendWhatsApp: async (phone, message) => {
      logger.info(`[WhatsApp SOS] Tentative d'envoi à ${phone}`);
      // EXEMPLE TWILIO:
      // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
      // await client.messages.create({ from: 'whatsapp:+123456', body: message, to: `whatsapp:${phone}` });
      return { success: true, service: "mock" };
    },
    sendSMS: async (phone, message) => {
      logger.info(`[SMS SOS] Tentative d'envoi à ${phone}`);
      // EXEMPLE INFOBIP/ORANGE:
      // const result = await axios.post('...', { to: phone, text: message });
      return { success: true, service: "mock" };
    }
  };

  const worker = new Worker(
    "notifications",
    async (job) => {
      const Utilisateur = db.Utilisateur;
      const ProfilDonneur = db.ProfilDonneur;
      const LogNotification = db.LogNotification;

      if (job.name === "sendCampaignNotification") {
        const { donneurId, telephone, nom, titre, message, centreId } =
          job.data;
        logger.info("Worker started campaign notification for donor", {
          donneurId,
        });

        const donor = await Utilisateur.findByPk(donneurId);
        if (donor && donor.push_token) {
          const pushMessage = expoNotifications.buildPushMessage({
            to: donor.push_token,
            title: titre,
            body: message,
            data: { type: "campaign", centreId },
          });

          const { successful, failed } =
            await expoNotifications.sendPushNotifications([pushMessage]);
          if (successful.length > 0) {
            logger.info(`Campaign push sent to ${donneurId}`);
          } else {
            logger.warn(`Campaign push failed for ${donneurId}`, failed);
          }
        }
        return { processed: 1 };
      }

      if (job.name === "sendMessageNotification") {
        const { senderId, recipientId, contenu, senderName } = job.data;
        logger.info("Worker processing private message notification", {
          senderId,
          recipientId,
        });

        const recipient = await Utilisateur.findByPk(recipientId);
        if (recipient && recipient.push_token) {
          const pushMessage = expoNotifications.buildPushMessage({
            to: recipient.push_token,
            title: `Message de ${senderName}`,
            body: contenu,
            data: { type: "message", senderId },
          });

          const { successful } = await expoNotifications.sendPushNotifications([
            pushMessage,
          ]);
          if (successful.length > 0) {
            logger.info(`Message push sent to ${recipientId}`);
          }
        }
        return { processed: 1 };
      }

      // Sinon, c'est une alerte d'urgence classique
      const {
        alertId,
        groupe_requis,
        latitude,
        longitude,
        rayon_action_km,
        validatorId,
        degre_urgence, // New param passed from controller
      } = job.data;

      // --- LOGIQUE MODE NUIT INTELLIGENT ---
      const currentHour = new Date().getHours();
      const isNight = currentHour >= 22 || currentHour < 7;
      
      // Si c'est la nuit et que ce n'est pas "VITAL" (TRES_URGENT), on reporte ou on annule le push
      if (isNight && degre_urgence !== "TRES_URGENT") {
        logger.info(`Night mode active. Skipping notification for ${degre_urgence} alert ${alertId}`);
        return { skipped: "night_mode", alertId };
      }

      logger.info("Worker started emergency notifications for alert", {
        alertId,
        degre_urgence,
      });

      const haversine = haversineSQL(
        latitude,
        longitude,
        "profilDonneur",
        "lat_actuelle",
        "long_actuelle",
      );

      const { BLOOD_COMPATIBILITY } = require("../utils/bloodCompatibility");

      const compatibleGroups =
        groupe_requis === "INCONNU"
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
              [db.Sequelize.Op.and]: db.sequelize.where(
                db.sequelize.literal(haversine),
                "<=",
                rayon_action_km,
              ),
            },
            required: true,
          },
        ],
        attributes: {
          include: [[db.sequelize.literal(haversine), "distance"]],
        },
      });

      const logsToCreate = [];
      const pushMessages = [];
      const donorMap = new Map(); // token -> donor object

      for (const donor of donors) {
        const distance = parseFloat(donor.dataValues.distance).toFixed(2);
        const messageText = `Besoin urgent de sang ${groupe_requis} à seulement ${distance} km de vous. Merci de répondre si vous pouvez aider !`;

        if (donor.push_token) {
          pushMessages.push(
            expoNotifications.buildPushMessage({
              to: donor.push_token,
              title: "Urgence Don de Sang",
              body: messageText,
              data: { alertId, groupe_sanguin: groupe_requis, distance },
            }),
          );
          donorMap.set(donor.push_token, { donor, distance, messageText });
        } else {
          // Pas de token push, on tente WhatsApp/SMS immédiatement
          let notified = false;
          if (donor.telephone) {
            const waResult = await deliveryService.sendWhatsApp(
              donor.telephone,
              `Vitasang SOS: ${messageText}`,
            );
            if (waResult.success) {
              notified = true;
              logsToCreate.push({
                id_utilisateur: donor.id_utilisateur,
                id_alerte: alertId,
                canal: "whatsapp",
                statut_reception: "envoye",
              });
            }
          }
          if (!notified && donor.telephone) {
            const smsResult = await deliveryService.sendSMS(
              donor.telephone,
              `SOS VITASANG: ${messageText}`,
            );
            if (smsResult.success) {
              logsToCreate.push({
                id_utilisateur: donor.id_utilisateur,
                id_alerte: alertId,
                canal: "sms",
                statut_reception: "envoye",
              });
            }
          }
        }
      }

      // Envoi groupé des notifications Push
      if (pushMessages.length > 0) {
        logger.info(
          `Sending ${pushMessages.length} push notifications in batch`,
        );
        const { successful, failed } =
          await expoNotifications.sendPushNotifications(pushMessages);

        // Traiter les succès
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

        // Traiter les échecs Push et tenter les replis (fallback)
        for (const fail of failed) {
          const info = donorMap.get(fail.token);
          if (info) {
            logger.warn(
              `Push failed for ${info.donor.id_utilisateur}, attempting fallback`,
              { error: fail.error },
            );

            let fallbackNotified = false;
            if (info.donor.telephone) {
              const waResult = await deliveryService.sendWhatsApp(
                info.donor.telephone,
                `Vitasang SOS: ${info.messageText}`,
              );
              if (waResult.success) {
                fallbackNotified = true;
                logsToCreate.push({
                  id_utilisateur: info.donor.id_utilisateur,
                  id_alerte: alertId,
                  canal: "whatsapp",
                  statut_reception: "envoye",
                });
              }
            }

            if (!fallbackNotified && info.donor.telephone) {
              const smsResult = await deliveryService.sendSMS(
                info.donor.telephone,
                `SOS VITASANG: ${info.messageText}`,
              );
              if (smsResult.success) {
                logsToCreate.push({
                  id_utilisateur: info.donor.id_utilisateur,
                  id_alerte: alertId,
                  canal: "sms",
                  statut_reception: "envoye",
                });
              }
            }

            // Log l'échec initial si aucun repli n'a marché
            if (!fallbackNotified) {
              logsToCreate.push({
                id_utilisateur: info.donor.id_utilisateur,
                id_alerte: alertId,
                canal: "push",
                statut_reception: "échec",
                push_token: fail.token,
                details_echec: fail.error,
              });
            }
          }
        }
      }

      if (logsToCreate.length > 0) {
        await LogNotification.bulkCreate(logsToCreate);
        logger.info(
          `${logsToCreate.length} notification logs created via bulkCreate`,
        );
      }

      return { processed: donors.length };
    },
    { connection },
  );

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed`, err);
  });
}

module.exports = { notificationQueue };
