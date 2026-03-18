require("dotenv").config();

/**
 * Script de seed pour peupler la base de données VitaSang
 * Correction : Formats de numéros valides pour Joi & Performance optimisée
 */

const db = require("../models");
const bcrypt = require("bcryptjs");

// Configuration
const BASE_LAT = 4.0822636;
const BASE_LON = 9.7802427;
const RADIUS_KM = 500;
const NUM_CENTRES = 250;
const NUM_USERS_PER_CENTRE = 40;
const BLOODGROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["Douala", "Yaoundé", "Buea", "Limbe", "Dschang", "Bamenda", "Garoua", "Maroua", "Bertoua"];

const DONNATION_TYPES = [
  { libelle: "Don de sang entier", delai_attente_jours: 56 },
  { libelle: "Plasma", delai_attente_jours: 48 },
  { libelle: "Plaquettes", delai_attente_jours: 3 },
];

/**
 * Génère un numéro de téléphone unique et VALIDE (Regex Joi compatible)
 */
function generatePhoneNumber(index) {
  const operators = ["65", "68", "69", "67"];
  const operator = operators[index % operators.length];

  // On utilise l'index pour garantir l'unicité sur les 7 derniers chiffres
  // Format final : +237 + 6 + XX (opérateur) + XXXXXXX (index) = 13 caractères total
  const uniquePart = String(index).padStart(7, "0");
  return `+2376${operator.slice(-1)}${uniquePart}`;
}

function generateRandomCoordinateInRadius(centerLat, centerLon, radiusKm) {
  const R = 6371;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.sqrt(Math.random()) * radiusKm;
  const lat1 = (centerLat * Math.PI) / 180;
  const lon1 = (centerLon * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) + Math.cos(lat1) * Math.sin(distance / R) * Math.cos(angle));
  const lon2 = lon1 + Math.atan2(Math.sin(angle) * Math.sin(distance / R) * Math.cos(lat1), Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  return { latitude: (lat2 * 180) / Math.PI, longitude: (lon2 * 180) / Math.PI };
}

function generateEmail(nom, prenom, index) {
  return `${prenom.toLowerCase().substring(0, 1)}${nom.toLowerCase().replace(/\s/g, '')}${index}@vitasang.cm`;
}

async function seed() {
  try {
    console.log("🚀 Démarrage du Seed optimisé...");
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: false });

    // 1. Types de Dons
    const typeDons = await db.TypeDon.bulkCreate(DONNATION_TYPES, { ignoreDuplicates: true });

    // 2. Centres
    console.log("🏥 Création des centres...");
    const centresData = [];
    for (let i = 0; i < NUM_CENTRES; i++) {
      const coords = generateRandomCoordinateInRadius(BASE_LAT, BASE_LON, RADIUS_KM);
      const city = CITIES[i % CITIES.length];
      centresData.push({
        nom_centre: `Hôpital ${city} #${i}`,
        adresse: `${i} Rue de la Santé`,
        ville: city,
        latitude: coords.latitude,
        longitude: coords.longitude,
        contact_urgence: generatePhoneNumber(900000 + i), // Plage haute pour les centres
        capacite_stockage_max: 5000
      });
    }
    const centres = await db.Centre.bulkCreate(centresData);

    // 3. Utilisateurs (Optimisé)
    console.log("👥 Préparation des 10 000 utilisateurs...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const usersData = [];
    let userIndex = 0;

    for (const centre of centres) {
      // 2 membres du personnel par centre
      for (let p = 0; p < 2; p++) {
        usersData.push({
          nom: "Staff", prenom: `User${userIndex}`,
          email: generateEmail("Staff", `User${userIndex}`, userIndex),
          mot_de_passe: hashedPassword,
          telephone: generatePhoneNumber(userIndex),
          role: "personnel", id_centre: centre.id_centre, est_actif: true
        });
        userIndex++;
      }

      // Les donneurs restants
      for (let d = 0; d < (NUM_USERS_PER_CENTRE - 2); d++) {
        usersData.push({
          nom: "Donneur", prenom: `User${userIndex}`,
          email: generateEmail("Donneur", `User${userIndex}`, userIndex),
          mot_de_passe: hashedPassword,
          telephone: generatePhoneNumber(userIndex),
          role: "donneur", est_actif: true
        });
        userIndex++;
      }
    }

    const createdUsers = await db.Utilisateur.bulkCreate(usersData, { batchSize: 1000 });
    console.log(`✅ ${createdUsers.length} utilisateurs créés.`);

    // 4. Profils Donneurs
    console.log("🎯 Création des profils...");
    const profilsData = createdUsers
      .filter(u => u.role === 'donneur')
      .map(u => ({
        id_donneur: u.id_utilisateur,
        groupe_sanguin: BLOODGROUPS[Math.floor(Math.random() * BLOODGROUPS.length)],
        lat_actuelle: BASE_LAT,
        long_actuelle: BASE_LON
      }));
    await db.ProfilDonneur.bulkCreate(profilsData, { batchSize: 1000 });

    console.log("\n✨ SEED TERMINÉ AVEC SUCCÈS !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

seed();
