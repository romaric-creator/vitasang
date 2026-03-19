const db = require("../models");
const logger = require("../config/logger");
const expoNotifications = require("../utils/expoNotifications");

let notificationQueue = { add: async () => { } };

if (process.env.NODE_ENV !== "test") {
    const { Queue, Worker } = require("bullmq");
    const IORedis = require("ioredis");

    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: null,
    });

    notificationQueue = new Queue("notifications", { connection });

    const worker = new Worker("notifications", async (job) => {
        const Utilisateur = db.Utilisateur;
        const ProfilDonneur = db.ProfilDonneur;
        const LogNotification = db.LogNotification;

        const { alertId, groupe_requis, latitude, longitude, rayon_action_km, validatorId } = job.data;
        logger.info("Worker started notifications for alert", { alertId });

        const haversine = `(
      6371 * acos(
        cos(radians(${latitude})) * cos(radians(\`profilDonneur\`.\`lat_actuelle\`)) * 
        cos(radians(\`profilDonneur\`.\`long_actuelle\`) - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(\`profilDonneur\`.\`lat_actuelle\`))
      )
    )`;

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

        const compatibleGroups = Object.keys(bloodCompatibility).filter((group) =>
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
                        [db.Sequelize.Op.and]: db.sequelize.where(db.sequelize.literal(haversine), "<=", rayon_action_km)
                    },
                    required: true,
                },
            ],
            attributes: {
                include: [[db.sequelize.literal(haversine), "distance"]]
            }
        });

        let messages = [];
        let logsToCreate = [];

        for (const donor of donors) {
            const distance = parseFloat(donor.dataValues.distance).toFixed(2);

            if (donor.push_token) {
                messages.push(
                    expoNotifications.buildPushMessage({
                        to: donor.push_token,
                        title: "Urgence Sang",
                        body: `Urgence sang ${groupe_requis} à ${distance} km de votre position !`,
                        data: { alertId, groupe_sanguin: groupe_requis, distance },
                    }),
                );
                logsToCreate.push({
                    id_utilisateur: donor.id_utilisateur,
                    id_alerte: alertId,
                    canal: "push",
                    statut_reception: "en_attente",
                    push_token: donor.push_token,
                });
            } else {
                logsToCreate.push({
                    id_utilisateur: donor.id_utilisateur,
                    id_alerte: alertId,
                    canal: "push",
                    statut_reception: "no_token",
                });
            }
        }

        if (logsToCreate.length > 0) {
            await LogNotification.bulkCreate(logsToCreate);
        }

        if (messages.length > 0) {
            const { successful, failed } = await expoNotifications.sendPushNotifications(messages);
            for (const token of successful) {
                await LogNotification.update(
                    { statut_reception: "envoye" },
                    { where: { push_token: token, id_alerte: alertId } }
                );
            }
            for (const { token, error } of failed) {
                await LogNotification.update(
                    { statut_reception: "echec", details_echec: error },
                    { where: { push_token: token, id_alerte: alertId } }
                );
            }
        }

        return { processed: donors.length };
    }, { connection });

    worker.on("failed", (job, err) => {
        logger.error(`Job ${job.id} failed`, err);
    });
}

module.exports = { notificationQueue };
