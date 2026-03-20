const { Utilisateur, ProfilDonneur, Centre, db } = require('../models');
const { notificationQueue } = require('../jobs/notification.queue');

/**
 * Controller pour gérer les campagnes de dons par les hôpitaux/centres
 */
const campaignsController = {
    // Lancer une nouvelle campagne
    launchCampaign: async (req, res) => {
        try {
            const { titre, message, filtres } = req.body;
            const centreId = req.user.centreId || req.user.centre?.id_centre; // Selon payload token

            if (!titre || !message) {
                return res.status(400).json({ success: false, message: 'Le titre et le message sont requis.' });
            }

            // 1. Définir les critères de recherche pour les donneurs
            const whereCondition = { disponible: true };

            if (filtres && filtres.groupe_sanguin) {
                whereCondition.groupe_sanguin = filtres.groupe_sanguin;
            }

            // 2. Trouver les donneurs ciblés
            const donneursCibles = await ProfilDonneur.findAll({
                where: whereCondition,
                include: [{
                    model: Utilisateur,
                    as: 'utilisateur',
                    required: true,
                    attributes: ['id_utilisateur', 'nom', 'prenom', 'telephone']
                }]
            });

            if (!donneursCibles || donneursCibles.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Aucun donneur ne correspond à ces critères de campagne.',
                });
            }

            // 3. Préparer les jobs pour BullMQ
            const jobs = donneursCibles.map(donneur => ({
                name: 'sendCampaignNotification',
                data: {
                    donneurId: donneur.utilisateur.id_utilisateur,
                    telephone: donneur.utilisateur.telephone,
                    nom: donneur.utilisateur.nom,
                    titre: titre,
                    message: message,
                    centreId: centreId
                },
                opts: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 }
                }
            }));

            // Ajouter les jobs à la file existante (notificationQueue)
            // La file devra pouvoir traiter ce nom de job.
            await notificationQueue.addBulk(jobs);

            return res.status(201).json({
                success: true,
                message: `Campagne "${titre}" lancée avec succès. Mode asynchrone activé.`,
                donneursTouches: donneursCibles.length
            });

        } catch (error) {
            console.error('Erreur launchCampaign:', error);
            return res.status(500).json({ success: false, message: 'Erreur lors du lancement de la campagne.' });
        }
    },

    // Obtenir l'historique (Simulé ou réel si l'on crée un Modèle Campagne plus tard)
    // Pour l'instant, retourne un tableau vide ou données statiques si le Frontend l'exige
    getCampaigns: async (req, res) => {
        try {
            // Pour une v1 rapide, on peut juste retourner 200 avec [] 
            // Si une vraie table "Campagne" est souhaitée, on la créera dans un second temps.
            return res.status(200).json({
                success: true,
                campaigns: []
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des campagnes.' });
        }
    }
};

module.exports = campaignsController;
