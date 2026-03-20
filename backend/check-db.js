require('dotenv').config();
const db = require('./models');

async function checkColumns() {
    try {
        const [results] = await db.sequelize.query("DESCRIBE Profils_Donneurs;");
        console.log("Columns in Profils_Donneurs:", results.map(r => r.Field));

        const [results2] = await db.sequelize.query("DESCRIBE Alertes_Urgence;");
        console.log("Columns in Alertes_Urgence:", results2.map(r => r.Field));

        const [results3] = await db.sequelize.query("DESCRIBE Notifications_Log;");
        console.log("Columns in Notifications_Log:", results3.map(r => r.Field));

        process.exit(0);
    } catch (error) {
        console.error("Error checking columns:", error);
        process.exit(1);
    }
}

checkColumns();
