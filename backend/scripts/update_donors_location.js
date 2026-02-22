// backend/scripts/update_donors_location.js
const db = require('../models');
const ProfilDonneur = db.ProfilDonneur;

// Coordonnées cibles (Par défaut : Yaoundé, Cameroun)
// L'utilisateur peut modifier ces valeurs selon sa position réelle
const TARGET_LAT = 4.0828;
const TARGET_LONG = 9.7795;
const RANGE = 0.1; // Rayon de dispersion (~10km)

const updateDonorsLocation = async () => {
    console.log('Mise à jour de la localisation des donneurs...');
    try {
        await db.sequelize.authenticate();
        console.log('Connexion à la base de données réussie.');

        const profiles = await ProfilDonneur.findAll();
        console.log(`Mise à jour de ${profiles.length} profils...`);

        for (const profile of profiles) {
            const lat = TARGET_LAT + (Math.random() - 0.5) * RANGE;
            const long = TARGET_LONG + (Math.random() - 0.5) * RANGE;

            await profile.update({
                lat_actuelle: parseFloat(lat.toFixed(6)),
                long_actuelle: parseFloat(long.toFixed(6))
            });
        }

        console.log('✅ Tous les donneurs ont été déplacés vers la zone cible !');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
    } finally {
        await db.sequelize.close();
        console.log('Connexion fermée.');
    }
};

updateDonorsLocation();
