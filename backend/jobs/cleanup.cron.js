const cron = require('node-cron');
const db = require('../models');
const logger = require('../config/logger');

// S'exécute tous les dimanches à 3h du matin
cron.schedule('0 3 * * 0', async () => {
    try {
        logger.info("Running LogNotification cleanup job...");
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deletedRows = await db.LogNotification.destroy({
            where: {
                createdAt: {
                    [db.Sequelize.Op.lt]: ninetyDaysAgo
                }
            }
        });

        logger.info(`Cleanup completed. Deleted ${deletedRows} old notifications.`);
    } catch (err) {
        logger.error("Cleaning cron job failed:", err);
    }
});

// Expiration des alertes après 72h — toutes les heures
cron.schedule('0 * * * *', async () => {
    try {
        logger.info("Running alert expiration job...");
        const seventyTwoHoursAgo = new Date();
        seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

        const [updatedCount] = await db.Alerte.update(
            { statut: "expire" },
            {
                where: {
                    statut: "en_cours",
                    createdAt: {
                        [db.Sequelize.Op.lt]: seventyTwoHoursAgo
                    }
                }
            }
        );

        if (updatedCount > 0) {
            logger.info(`Alert expiration completed. Expired ${updatedCount} alerts.`);
        }
    } catch (err) {
        logger.error("Alert expiration cron job failed:", err);
    }
});

module.exports = cron;
