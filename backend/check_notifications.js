const db = require("./models");

async function check() {
  try {
    const lastAlert = await db.Alerte.findOne({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.LogNotification,
          as: 'notifications',
          include: [{ model: db.Utilisateur, as: 'destinataire' }]
        }
      ]
    });

    if (!lastAlert) {
      console.log("No alerts found.");
      return;
    }

    console.log("Last Alert ID:", lastAlert.id_alerte);
    console.log("Created At:", lastAlert.createdAt);
    console.log("Target Blood Group:", lastAlert.groupe_requis);
    console.log("Location:", lastAlert.latitude, lastAlert.longitude);
    console.log("Radius:", lastAlert.rayon_action_km);
    console.log("--- Notifications ---");
    
    lastAlert.notifications.forEach(n => {
      console.log(`- User: ${n.destinataire.nom} (${n.destinataire.id_utilisateur})`);
      console.log(`  Token: ${n.destinataire.push_token ? n.destinataire.push_token.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`  Status: ${n.statut_reception}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

check();
