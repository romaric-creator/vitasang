// backend/scripts/seed.js
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const db = require('../models');
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;

// Nombre d'utilisateurs à générer
const NUM_DONORS = 250;

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const seedDatabase = async () => {
  console.log('Début du script d\'amorçage de masse...');
  try {
    await db.sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');

    // On supprime les anciens utilisateurs de test pour éviter les doublons
    // et les erreurs de contrainte unique sur le téléphone.
    console.log('Suppression des anciens utilisateurs de test...');
    await Utilisateur.destroy({ where: { nom: { [db.Sequelize.Op.like]: '%(Test)' } } });
    console.log('Anciens utilisateurs de test supprimés.');

    console.log(`Génération de ${NUM_DONORS} nouveaux donneurs...`);
    const donorsToCreate = [];
    for (let i = 0; i < NUM_DONORS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      donorsToCreate.push({
        user: {
          nom: `${lastName} (Test)`,
          prenom: firstName,
          // On génère un numéro de téléphone unique pour chaque itération
          telephone: `06${faker.string.numeric(8)}`,
          mot_de_passe: 'password123', // Mot de passe commun pour les tests
          role: 'donneur',
        },
        profile: {
          groupe_sanguin: faker.helpers.arrayElement(bloodTypes),
          // Coordonnées GPS aléatoires autour de Paris
          lat_actuelle: faker.location.latitude({ min: 48.7, max: 49.0, precision: 6 }),
          long_actuelle: faker.location.longitude({ min: 2.2, max: 2.5, precision: 6 }),
        },
      });
    }

    for (const donorData of donorsToCreate) {
      const hashedPassword = await bcrypt.hash(donorData.user.mot_de_passe, 10);

      await Utilisateur.create(
        {
          ...donorData.user,
          mot_de_passe: hashedPassword,
          profilDonneur: donorData.profile,
        },
        {
          include: [{ model: ProfilDonneur, as: 'profilDonneur' }],
        },
      );
    }
    
    console.log(`✅ ${NUM_DONORS} donneurs ont été créés avec succès !`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'amorçage de la base de données:', error);
  } finally {
    await db.sequelize.close();
    console.log('Connexion à la base de données fermée.');
  }
};

seedDatabase();