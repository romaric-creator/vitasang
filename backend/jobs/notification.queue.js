const db = require("../models");
const logger = require("../config/logger");
const expoNotifications = require("../utils/expoNotifications");
const { haversineSQL } = require("../utils/geoHelpers");

let notificationQueue = { add: async () => { } };

if (process.env.NODE_ENV !== "test") {
    const { Queue, Worker } = require("bullmq");
    const IORedis = require("ioredis");

    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: null,
    });

    notificationQueue = new Queue("notifications", { connection });

    // Simulation des canaux WhatsApp et SMS (Guide Section 4.1)
    const sendWhatsAppMessage = async (phone, message) => {
        logger.info(`[WhatsApp SOS] Tentative d'envoi à ${phone}`);
        // Ici on appellerait l'API Meta ou un service tiers
        return { success: true };
    };

    const sendSMS = async (phone, message) => {
        logger.info(`[SMS SOS] Tentative d'envoi à ${phone}`);
        // Ici on appellerait une passerelle SMS Orange/MTN
        return { success: true };
    };

    const worker = new Worker("notifications", async (job) => {
        const Utilisateur = db.Utilisateur;
        const ProfilDonneur = db.ProfilDonneur;
        const LogNotification = db.LogNotification;

        if (job.name === "sendCampaignNotification") {
            const { donneurId, telephone, nom, titre, message, centreId } = job.data;
            logger.info("Worker started campaign notification for donor", { donneurId });

            const donor = await Utilisateur.findByPk(donneurId);
            if (donor && donor.push_token) {
                const pushMessage = expoNotifications.buildPushMessage({
                    to: donor.push_token,
                    title: titre,
                    body: message,
                    data: { type: 'campaign', centreId }
                });

                const { successful, failed } = await expoNotifications.sendPushNotifications([pushMessage]);
                if (successful.length > 0) {
                    logger.info(`Campaign push sent to ${donneurId}`);
                } else {
                    logger.warn(`Campaign push failed for ${donneurId}`, failed);
                }
            }
            return { processed: 1 };
        }

        // Sinon, c'est une alerte d'urgence classique
        const { alertId, groupe_requis, latitude, longitude, rayon_action_km, validatorId } = job.data;
        logger.info("Worker started emergency notifications for alert", { alertId });

        const haversine = haversineSQL(latitude, longitude, "profilDonneur", "lat_actuelle", "long_actuelle");

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

        const compatibleGroups =
            groupe_requis === "INCONNU"
                ? ["O-"]
                : Object.keys(bloodCompatibility).filter((group) =>
                    bloodCompatibility[group].includes(groupe_requis)
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
                        [db.Sequelize.Op.and]: db.sequelize.where(db.sequelize.literal(haversine), "<=", rayon_action_km)
                    },
                    required: true,
                },
            ],
            attributes: {
                include: [[db.sequelize.literal(haversine), "distance"]]
            }
        });

        for (const donor of donors) {
            const distance = parseFloat(donor.dataValues.distance).toFixed(2);
            let notified = false;
            const messageText = `Urgence sang ${groupe_requis} à ${distance} km de votre position !`;

            // 1. Canal FCM (Push)
            if (donor.push_token) {
                const pushMessage = expoNotifications.buildPushMessage({
                    to: donor.push_token,
                    title: "Urgence Sang",
                    body: messageText,
                    data: { alertId, groupe_sanguin: groupe_requis, distance },
                });

                const { successful } = await expoNotifications.sendPushNotifications([pushMessage]);
                if (successful.length > 0) {
                    notified = true;
                    await LogNotification.create({
                        id_utilisateur: donor.id_utilisateur,
                        id_alerte: alertId,
                        canal: "push",
                        statut_reception: "envoye",
                        push_token: donor.push_token,
                    });
                }
            }

            // 2. Canal WhatsApp (si Push a échoué ou non disponible)
            if (!notified && donor.telephone) {
                const waResult = await sendWhatsAppMessage(donor.telephone, `Vitasang SOS: ${messageText}`);
                if (waResult.success) {
                    notified = true;
                    await LogNotification.create({
                        id_utilisateur: donor.id_utilisateur,
                        id_alerte: alertId,
                        canal: "whatsapp",
                        statut_reception: "envoye",
                    });
                }
            }

            // 3. Canal SMS (Dernier recours)
            if (!notified && donor.telephone) {
                const smsResult = await sendSMS(donor.telephone, `SOS VITASANG: ${messageText}`);
                if (smsResult.success) {
                    await LogNotification.create({
                        id_utilisateur: donor.id_utilisateur,
                        id_alerte: alertId,
                        canal: "sms",
                        statut_reception: "envoye",
                    });
                }
            }
        }

        return { processed: donors.length };
    }, { connection });

    worker.on("failed", (job, err) => {
        logger.error(`Job ${job.id} failed`, err);
    });
}

module.exports = { notificationQueue };
