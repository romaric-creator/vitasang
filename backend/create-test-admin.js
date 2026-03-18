/**
 * Script de création d'un utilisateur ADMIN de test
 * Usage: node backend/create-test-admin.js
 */

require("dotenv").config();
const db = require("./models");
const bcrypt = require("bcryptjs");

async function createTestAdmin() {
  try {
    console.log("🚀 Création de l'admin de test...");
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: false });

    // Créer un centre pour l'admin
    const centre = await db.Centre.findOrCreate({
      where: { nom_centre: "Centre Admin Test" },
      defaults: {
        adresse: "123 Rue Principale",
        ville: "Douala",
        latitude: 4.0511,
        longitude: 9.7679,
        contact_urgence: "+237651234567",
        capacite_stockage_max: 5000,
      },
    });

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Créer ou mettre à jour l'admin
    const [admin, created] = await db.Utilisateur.findOrCreate({
      where: { telephone: "+237651234567" },
      defaults: {
        nom: "ADMIN",
        prenom: "Test",
        email: "admin@vitasang.cm",
        mot_de_passe: hashedPassword,
        telephone: "+237651234567",
        role: "admin",
        id_centre: centre[0].id_centre,
        est_actif: true,
      },
    });

    if (!created) {
      // Si existe déjà, mettre à jour
      admin.mot_de_passe = hashedPassword;
      admin.role = "admin";
      await admin.save();
    }

    console.log("✅ Utilisateur admin créé/mis à jour avec succès!");
    console.log("📋 Identifiants de test:");
    console.log("   Téléphone: +237651234567");
    console.log("   Mot de passe: admin123");
    console.log("   Rôle: admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

createTestAdmin();
