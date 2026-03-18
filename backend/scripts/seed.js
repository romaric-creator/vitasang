require("dotenv").config();

/**
 * Script de seed pour peupler la base de données VitaSang
 * Crée: 50 centres de santé, 10000 utilisateurs, stocks, rendez-vous, alertes
 * Position de base: Douala, Cameroun (4.0822636, 9.7802427)
 * Rayon: 500km
 */

const db = require("../models");
const bcrypt = require("bcryptjs");

// Configuration
const BASE_LAT = 4.0822636;
const BASE_LON = 9.7802427;
const RADIUS_KM = 500;
const NUM_CENTRES = 50;
const NUM_USERS_PER_CENTRE = 200;
const BLOODGROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = [
  "Douala",
  "Yaoundé",
  "Buea",
  "Limbe",
  "Tiko",
  "Edéa",
  "Kribi",
  "Dschang",
  "Bamenda",
  "Garoua",
  "Ngaoundéré",
  "Maroua",
  "Kousseri",
  "Ebolowa",
  "Bertoua",
];
const DONNATION_TYPES = [
  { libelle: "Don de sang entier", delai_attente_jours: 56 },
  { libelle: "Plasma", delai_attente_jours: 48 },
  { libelle: "Plaquettes", delai_attente_jours: 3 },
];

/**
 * Génère une coordonnée aléatoire dans un rayon circulaire
 */
function generateRandomCoordinateInRadius(centerLat, centerLon, radiusKm) {
  const R = 6371;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.sqrt(Math.random()) * radiusKm;
  const lat1 = (centerLat * Math.PI) / 180;
  const lon1 = (centerLon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(angle),
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(angle) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
}

/**
 * Génère un numéro de téléphone
 */
function generatePhoneNumber() {
  const operators = ["65", "68", "69", "67", "75"];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const numbers = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return operator + numbers;
}

/**
 * Génère un email
 */
function generateEmail(nom, prenom, index) {
  const domains = ["vitasang.cm", "gmail.com", "yahoo.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prenom.toLowerCase().substring(0, 1)}${nom.toLowerCase().substring(0, 8)}${String(index).padStart(5, "0")}@${domain}`;
}

/**
 * Hash un mot de passe
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Crée les types de dons
 */
async function seedTypeDons() {
  console.log("📋 Création des types de dons...");

  const existingTypes = await db.TypeDon.findAll();
  if (existingTypes.length > 0) {
    console.log("✓ Types de dons déjà existants");
    return existingTypes;
  }

  const types = await db.TypeDon.bulkCreate(DONNATION_TYPES);
  console.log(`✓ ${types.length} types de dons créés`);
  return types;
}

/**
 * Crée les centres de santé
 */
async function seedCentres() {
  console.log("\n🏥 Création des centres de santé...");

  const existingCentres = await db.Centre.findAll();
  if (existingCentres.length > 0) {
    console.log(`✓ ${existingCentres.length} centres déjà existants`);
    return existingCentres;
  }

  const centres = [];
  const noms = [
    "Hôpital Central",
    "Clinique",
    "Centre Hospitalier",
    "Centre de Transfusion",
    "Polyclinique",
    "Dispensaire",
    "Maternité",
    "Hôpital de Campagne",
    "Centre d'Urgence",
    "Clinique Privée",
  ];

  for (let i = 0; i < NUM_CENTRES; i++) {
    const coords = generateRandomCoordinateInRadius(
      BASE_LAT,
      BASE_LON,
      RADIUS_KM,
    );
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const nomType = noms[Math.floor(Math.random() * noms.length)];
    const centreNum = String(i + 1).padStart(3, "0");

    centres.push({
      nom_centre: `${nomType} ${city} #${centreNum}`,
      adresse: `${Math.floor(Math.random() * 1000) + 1} Rue de la Santé, ${city}`,
      ville: city,
      latitude: coords.latitude,
      longitude: coords.longitude,
      contact_urgence: generatePhoneNumber(),
      capacite_stockage_max: 5000 + Math.floor(Math.random() * 5000),
    });
  }

  const created = await db.Centre.bulkCreate(centres);
  console.log(`✓ ${created.length} centres de santé créés`);
  return created;
}

/**
 * Crée les stocks de sang
 */
async function seedStocks(centres) {
  console.log("\n🩸 Création des stocks de sang...");

  const existingStocks = await db.StockSang.count();
  if (existingStocks > 0) {
    console.log(`✓ ${existingStocks} stocks déjà existants`);
    return;
  }

  const stocks = [];

  for (const centre of centres) {
    for (const bloodGroup of BLOODGROUPS) {
      stocks.push({
        id_centre: centre.id_centre,
        groupe_sanguin: bloodGroup,
        quantite_poches: Math.floor(Math.random() * 500) + 10,
        seuil_alerte_min: Math.floor(Math.random() * 20) + 5,
      });
    }
  }

  await db.StockSang.bulkCreate(stocks, { batchSize: 500 });
  console.log(`✓ ${stocks.length} stocks de sang créés`);
}

/**
 * Crée les utilisateurs
 */
async function seedUtilisateurs(centres) {
  console.log("\n👥 Création des utilisateurs (10000+)...");

  const existingCount = await db.Utilisateur.count();
  if (existingCount > 0) {
    console.log(`✓ ${existingCount} utilisateurs déjà existants`);
    const result = await db.Utilisateur.findAll({ raw: true });
    return result;
  }

  const noms = [
    "Nguema",
    "Tandeu",
    "Mbango",
    "Keba",
    "Adjé",
    "Boukar",
    "Diallo",
    "Nkomo",
    "Kamara",
    "Sissoko",
    "Toure",
    "Ba",
    "Diop",
    "Sall",
    "Cissé",
    "Traoré",
    "Kone",
    "Sanogo",
    "Maiga",
    "Bah",
    "Ouedraogo",
    "Sylla",
    "Sow",
    "Diouf",
    "Niane",
    "Keita",
    "Camara",
    "Balde",
    "Sene",
    "Faye",
  ];

  const prenoms = [
    "Jean",
    "Marie",
    "Pierre",
    "Paul",
    "Sophie",
    "Luc",
    "Anne",
    "Marc",
    "Claire",
    "Michel",
    "Amélie",
    "Patrick",
    "Nicole",
    "Philippe",
    "Isabelle",
    "Vincent",
    "Laurence",
    "Christophe",
    "Véronique",
    "Bruno",
    "Catherine",
    "Laurent",
    "Martine",
    "François",
    "Nathalie",
  ];

  const regions = ["Sud", "Centre", "Nord", "Est", "Ouest", "Littoral"];

  const users = [];
  let userIndex = 0;

  // Personnel des centres
  for (const centre of centres) {
    const numPersonnel = Math.floor(Math.random() * 5) + 3;

    for (let p = 0; p < numPersonnel; p++) {
      const nom = noms[Math.floor(Math.random() * noms.length)];
      const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
      const hashedPassword = await hashPassword("Password123!");

      users.push({
        nom,
        prenom,
        region: regions[Math.floor(Math.random() * regions.length)],
        email: generateEmail(nom, prenom, userIndex),
        mot_de_passe: hashedPassword,
        telephone: generatePhoneNumber(),
        role: p === 0 ? "admin" : "personnel",
        est_actif: true,
        id_centre: centre.id_centre,
        push_token: `token_${Math.random().toString(36).substring(2, 15)}`,
      });

      userIndex++;
    }
  }

  // Donneurs
  const personalCount = users.length;
  const targetDonneurs = NUM_USERS_PER_CENTRE * NUM_CENTRES - personalCount;

  console.log(`  → ${personalCount} personnel + ${targetDonneurs} donneurs`);

  for (let i = 0; i < targetDonneurs; i++) {
    const nom = noms[Math.floor(Math.random() * noms.length)];
    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const hashedPassword = await hashPassword("Password123!");

    users.push({
      nom,
      prenom,
      region: regions[Math.floor(Math.random() * regions.length)],
      email: generateEmail(nom, prenom, userIndex),
      mot_de_passe: hashedPassword,
      telephone: generatePhoneNumber(),
      role: "donneur",
      est_actif: Math.random() > 0.1,
      push_token: `token_${Math.random().toString(36).substring(2, 15)}`,
    });

    userIndex++;

    if (i % 2000 === 0 && i > 0) {
      console.log(`  ✓ ${i}/${targetDonneurs} donneurs créés...`);
    }
  }

  const created = await db.Utilisateur.bulkCreate(users, { batchSize: 500 });
  console.log(`✓ Total: ${created.length} utilisateurs créés`);
  return created;
}

/**
 * Crée les profils de donneurs
 */
async function seedProfilDonneurs(users) {
  console.log("\n🎯 Création des profils de donneurs...");

  const existingCount = await db.ProfilDonneur.count();
  if (existingCount > 0) {
    console.log(`✓ ${existingCount} profils déjà existants`);
    return;
  }

  const donneurs = users.filter((u) => u.role === "donneur");
  const profils = [];

  for (const donneur of donneurs) {
    const coords = generateRandomCoordinateInRadius(
      BASE_LAT,
      BASE_LON,
      RADIUS_KM,
    );

    profils.push({
      id_donneur: donneur.id_utilisateur,
      groupe_sanguin:
        BLOODGROUPS[Math.floor(Math.random() * BLOODGROUPS.length)],
      latitude: coords.latitude,
      longitude: coords.longitude,
      dernier_don: new Date(
        Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
      ),
      est_eligible: Math.random() > 0.15,
    });
  }

  await db.ProfilDonneur.bulkCreate(profils, { batchSize: 500 });
  console.log(`✓ ${profils.length} profils de donneurs créés`);
}

/**
 * Crée les rendez-vous
 */
async function seedRendezVous(users, centres, typeDons) {
  console.log("\n📅 Création des rendez-vous...");

  const existingCount = await db.RendezVous.count();
  if (existingCount > 0) {
    console.log(`✓ ${existingCount} rendez-vous déjà existants`);
    return;
  }

  const donneurs = users.filter((u) => u.role === "donneur");
  const rdvs = [];
  const numRdv = Math.floor(donneurs.length * 0.3);

  for (let i = 0; i < numRdv; i++) {
    const donneur = donneurs[Math.floor(Math.random() * donneurs.length)];
    const centre = centres[Math.floor(Math.random() * centres.length)];
    const typeDon = typeDons[Math.floor(Math.random() * typeDons.length)];

    const daysOffset = Math.floor(Math.random() * 60) - 30;
    const rdvDate = new Date();
    rdvDate.setDate(rdvDate.getDate() + daysOffset);
    rdvDate.setHours(Math.floor(Math.random() * 8) + 7, 0, 0, 0);

    // Générer un code court (max 12 caractères): RDV + 4 chiffres aléatoires + 2 chiffres de l'index
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const indexPart = (i % 100).toString().padStart(2, "0");
    const uniqueCode = `RDV${randomNum}${indexPart}`.slice(0, 12);

    rdvs.push({
      id_donneur: donneur.id_utilisateur,
      id_centre: centre.id_centre,
      id_type_don: typeDon.id_type_don,
      date_heure_rdv: rdvDate,
      statut_rdv: ["planifie", "valide", "absent", "annule"][
        Math.floor(Math.random() * 4)
      ],
      code_unique: uniqueCode,
    });
  }

  await db.RendezVous.bulkCreate(rdvs, { batchSize: 500 });
  console.log(`✓ ${rdvs.length} rendez-vous créés`);
}

/**
 * Crée les alertes SOS
 */
async function seedAlertes(centres) {
  console.log("\n🚨 Création des alertes SOS...");

  const existingCount = await db.Alerte.count();
  if (existingCount > 0) {
    console.log(`✓ ${existingCount} alertes déjà existantes`);
    return;
  }

  const alertes = [];
  const urgences = ["NORMAL", "URGENT", "TRES_URGENT"];
  const statuts = ["en_attente_validation", "en_cours", "resolu", "annule"];
  const numAlertes = Math.floor(centres.length * 0.1);

  for (let i = 0; i < numAlertes; i++) {
    const centre = centres[Math.floor(Math.random() * centres.length)];

    alertes.push({
      id_centre: centre.id_centre,
      groupe_requis:
        BLOODGROUPS[Math.floor(Math.random() * BLOODGROUPS.length)],
      degre_urgence: urgences[Math.floor(Math.random() * urgences.length)],
      quantite_requise: Math.floor(Math.random() * 50) + 5,
      rayon_action_km: Math.floor(Math.random() * 100) + 10,
      lieu: centre.adresse,
      description: `Alerte SOS au centre ${centre.nom_centre}`,
      latitude: centre.latitude,
      longitude: centre.longitude,
      statut: statuts[Math.floor(Math.random() * statuts.length)],
    });
  }

  await db.Alerte.bulkCreate(alertes);
  console.log(`✓ ${alertes.length} alertes SOS créées`);
}

/**
 * Crée les historiques de dons
 */
async function seedHistoriqueDons(users, centres, typeDons) {
  console.log("\n📊 Création des historiques de dons...");

  const existingCount = await db.HistoriqueDon.count();
  if (existingCount > 0) {
    console.log(`✓ ${existingCount} historiques déjà existants`);
    return;
  }

  const donneurs = users.filter((u) => u.role === "donneur");
  const historiques = [];
  const numHistoriques = Math.floor(donneurs.length * 0.4);

  for (let i = 0; i < numHistoriques; i++) {
    const donneur = donneurs[Math.floor(Math.random() * donneurs.length)];
    const centre = centres[Math.floor(Math.random() * centres.length)];
    const typeDon = typeDons[Math.floor(Math.random() * typeDons.length)];

    const daysAgo = Math.floor(Math.random() * 730);
    const donDate = new Date();
    donDate.setDate(donDate.getDate() - daysAgo);

    historiques.push({
      id_donneur: donneur.id_utilisateur,
      id_centre: centre.id_centre,
      id_type_don: typeDon.id_type_don,
      date_don: donDate,
      groupe_sanguin:
        BLOODGROUPS[Math.floor(Math.random() * BLOODGROUPS.length)],
      volume_collecte: Math.floor(Math.random() * 200) + 400,
      statut_collecte: ["reussi", "abandonne"][Math.floor(Math.random() * 2)],
    });

    if (i % 2000 === 0 && i > 0) {
      console.log(`  ✓ ${i}/${numHistoriques} historiques créés...`);
    }
  }

  await db.HistoriqueDon.bulkCreate(historiques, { batchSize: 500 });
  console.log(`✓ ${historiques.length} historiques de dons créés`);
}

/**
 * Fonction principale
 */
async function seed() {
  try {
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║   🏥 VITASANG - BASE DE DONNÉES SEED SCRIPT 🏥   ║");
    console.log("║   Position: Douala (4.08°N, 9.78°E)               ║");
    console.log("║   Rayon: 500km | Centres: 50 | Utilisateurs: 10K ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    // Connexion
    await db.sequelize.authenticate();
    console.log("✅ Connexion à la BD établie");

    // Sync
    await db.sequelize.sync({ force: true });
    console.log("✅ Synchronisation BD complète\n");

    // Seed
    const typeDons = await seedTypeDons();
    const centres = await seedCentres();
    await seedStocks(centres);
    const users = await seedUtilisateurs(centres);
    await seedProfilDonneurs(users);
    await seedRendezVous(users, centres, typeDons);
    await seedAlertes(centres);
    await seedHistoriqueDons(users, centres, typeDons);

    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║   ✅ SEED DATABASE COMPLETED SUCCESSFULLY!  ✅   ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    console.log("📊 STATISTIQUES FINALES:");
    console.log(`  • Types de dons: ${typeDons.length}`);
    console.log(`  • Centres de santé: ${centres.length}`);
    console.log(`  • Utilisateurs: ${users.length}`);
    console.log(`  • Stocks de sang: ${centres.length * 8}`);
    console.log(
      `  • Rendez-vous: ~${Math.floor(users.filter((u) => u.role === "donneur").length * 0.3)}`,
    );
    console.log(`  • Alertes SOS: ~${Math.floor(centres.length * 0.1)}`);
    console.log(
      `  • Historiques: ~${Math.floor(users.filter((u) => u.role === "donneur").length * 0.4)}\n`,
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur lors du seed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
