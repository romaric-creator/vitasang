const { Utilisateur, ProfilDonneur, Centre, Campagne, db } = require('../models');
const { notificationQueue } = require('../jobs/notification.queue');

/**
 * Controller pour gérer les campagnes de dons par les hôpitaux/centres
 */
const campaignsController = {
    // Lancer une nouvelle campagne
    launchCampaign: async (req, res) => {
        try {
            const { titre, message, filtres } = req.body;
            const centreId = req.user.centreId || req.user.centre?.id_centre;

            if (!titre || !message) {
                return res.status(400).json({ success: false, message: 'Le titre et le message sont requis.' });
            }

            // 1. Définir les critères de recherche pour les donneurs
            const whereCondition = { disponible: true };
            if (filtres?.groupe_sanguin) {
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

            // 3. Persister la campagne en BDD
            const campagne = await Campagne.create({
                titre,
                message,
                groupe_sanguin_cible: filtres?.groupe_sanguin || null,
                donneurs_touches: donneursCibles.length,
                statut: 'lancee',
                id_centre: centreId || null,
            });

            // 4. Préparer les jobs pour BullMQ
            const jobs = donneursCibles.map(donneur => ({
                name: 'sendCampaignNotification',
                data: {
                    donneurId: donneur.utilisateur.id_utilisateur,
                    telephone: donneur.utilisateur.telephone,
                    nom: donneur.utilisateur.nom,
                    titre,
                    message,
                    centreId,
                    campagneId: campagne.id_campagne,
                },
                opts: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
            }));

            await notificationQueue.addBulk(jobs);

            return res.status(201).json({
                success: true,
                message: `Campagne "${titre}" lancée avec succès.`,
                donneursTouches: donneursCibles.length,
                campagne,
            });

        } catch (error) {
            console.error('Erreur launchCampaign:', error);
            return res.status(500).json({ success: false, message: 'Erreur lors du lancement de la campagne.' });
        }
    },

    // Obtenir l'historique réel des campagnes
    getCampaigns: async (req, res) => {
        try {
            const centreId = req.user.centreId || req.user.centre?.id_centre;
            const whereClause = centreId ? { id_centre: centreId } : {};

            const campaigns = await Campagne.findAll({
                where: whereClause,
                include: [{ model: Centre, as: 'centre', attributes: ['nom_centre', 'adresse'] }],
                order: [['createdAt', 'DESC']],
                limit: 50,
            });

            return res.status(200).json({ success: true, campaigns });
        } catch (error) {
            console.error('Erreur getCampaigns:', error);
            return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des campagnes.' });
        }
    }
};

module.exports = campaignsController;
