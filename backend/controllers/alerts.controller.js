const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const LogNotification = db.LogNotification;
const logger = require("../config/logger");
const { calculateDistance } = require("../utils/geoHelpers");
const { Expo } = require('expo-server-sdk'); // Import Expo SDK

let expo = new Expo(); // Initialize Expo SDK

const bloodCompatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
};

exports.createAlertAndNotify = async (req, res) => {
    // id_initiateur will now come from req.user.id, not req.body
    const { latitude, longitude, groupe_sanguin, radius, urgence, quantite_requise, lieu, description } = req.body;
    const id_initiateur = req.user.id; // Get initiator ID from authenticated user

    try {
        logger.info('Creating alert', { userId: id_initiateur, groupe_sanguin, latitude, longitude, radius });

        // 1. Enregistrer l'alerte
        const alerte = await Alerte.create({
            groupe_requis: groupe_sanguin,
            degre_urgence: urgence || "NORMAL",
            rayon_action_km: radius || 10,
            id_initiateur: id_initiateur,
            latitude,
            longitude,
            lieu,
            description,
            quantite_requise: quantite_requise || 1,
            statut: "en_cours"
        });

        logger.info('Alert created', { alertId: alerte.id_alerte });

        // 2. Trouver les donneurs compatibles
        const compatibleGroups = Object.keys(bloodCompatibility).filter(group =>
            bloodCompatibility[group].includes(groupe_sanguin)
        );

        logger.info('Compatible blood groups', { groupe_sanguin, compatible: compatibleGroups });

        const donors = await Utilisateur.findAll({
            where: { role: 'donneur' },
            include: [{
                model: ProfilDonneur,
                as: 'profilDonneur',
                where: { groupe_sanguin: compatibleGroups }
            }]
        });

        logger.info('Donors found', { totalDonors: donors.length, bloodGroups: compatibleGroups });

        let messages = [];
        const notifiedDonors = [];
        let donorsInRadius = 0;
        let donorsWithToken = 0;

        for (const donor of donors) {
            if (donor.profilDonneur && donor.profilDonneur.lat_actuelle && donor.profilDonneur.long_actuelle) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    donor.profilDonneur.lat_actuelle,
                    donor.profilDonneur.long_actuelle
                );

                if (distance <= (radius || 10)) {
                    donorsInRadius++;

                    // 3. Préparer la notification push si le token existe
                    if (donor.token_firebase && Expo.isExpoPushToken(donor.token_firebase)) {
                        donorsWithToken++;
                        messages.push({
                            to: donor.token_firebase,
                            sound: 'default',
                            body: `Urgence sang ${groupe_sanguin} à ${distance.toFixed(2)} km de votre position !`,
                            data: { alertId: alerte.id_alerte, groupe_sanguin, distance: distance.toFixed(2) },
                        });

                        logger.info('Preparing notification', {
                            donorId: donor.id_utilisateur,
                            distance: distance.toFixed(2),
                            hasToken: true
                        });
                    } else {
                        logger.warn('Donor has no token', {
                            donorId: donor.id_utilisateur,
                            hasToken: !!donor.token_firebase,
                            distance: distance.toFixed(2)
                        });
                    }

                    // 4. Créer un log de notification (statut initial 'pending' ou 'envoye')
                    await LogNotification.create({
                        id_utilisateur: donor.id_utilisateur,
                        id_alerte: alerte.id_alerte,
                        canal: 'push',
                        statut_reception: 'envoye' // Sera mis à jour après l'envoi réel
                    });

                    notifiedDonors.push({
                        id: donor.id_utilisateur,
                        username: donor.nom,
                        distance: distance.toFixed(2)
                    });
                }
            }
        }

        logger.info('Alert notification summary', {
            alertId: alerte.id_alerte,
            totalDonors: donors.length,
            inRadius: donorsInRadius,
            withToken: donorsWithToken,
            toNotify: messages.length
        });

        // 5. Envoyer toutes les notifications en une seule fois
        if (messages.length > 0) {
            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];
            (async () => {
                for (let chunk of chunks) {
                    try {
                        logger.info('Sending notification chunk', { chunkSize: chunk.length });
                        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        tickets.push(...ticketChunk);
                        logger.info('Notification chunk sent', { ticketCount: ticketChunk.length });
                    } catch (error) {
                        logger.error('Error sending push notification chunk', { error: error.message });
                    }
                }
            })();
        } else {
            logger.warn('No notifications to send', { alertId: alerte.id_alerte });
        }

        res.status(201).json({
            success: true,
            message: `${notifiedDonors.length} donneurs ont été notifiés.`,
            alertId: alerte.id_alerte,
            donorsCount: notifiedDonors.length,
            summary: {
                totalDonorsFound: donors.length,
                donorsInRadius,
                donorsWithToken,
                notified: notifiedDonors.length
            },
            notifiedDonors: notifiedDonors
        });

    } catch (error) {
        logger.error('Error creating alert', { error: error.message, userId: id_initiateur });
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'alerte",
            error: error.message
        });
    }
};

exports.getAlertStatus = async (req, res) => {
    const { id } = req.params; // Alert ID
    const userId = req.user.id; // Authenticated user ID
    const userRole = req.user.role; // Authenticated user role

    try {
        const alerte = await Alerte.findByPk(id, {
            include: [
                {
                    model: LogNotification,
                    as: 'notifications',
                    include: [
                        { model: Utilisateur, as: 'destinataire', attributes: ['nom', 'prenom', 'telephone'] }
                    ]
                },
                {
                    model: Utilisateur,
                    as: 'initiateur',
                    attributes: ['nom', 'prenom', 'telephone']
                }
            ]
        });

        if (!alerte) {
            return res.status(404).json({ success: false, message: "Alerte non trouvée" });
        }

        // Authorization check: Only initiator or admin can view status
        if (alerte.id_initiateur !== userId && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized: You do not have permission to view this alert status." });
        }

        const stats = {
            total: alerte.notifications.length,
            envoye: alerte.notifications.filter(n => n.statut_reception === 'envoye').length,
            lu: alerte.notifications.filter(n => n.statut_reception === 'lu').length,
            accepte: alerte.notifications.filter(n => n.statut_reception === 'accepte').length,
            ignore: alerte.notifications.filter(n => n.statut_reception === 'ignore').length,
        };

        res.json({
            success: true,
            alerte: {
                id: alerte.id_alerte,
                groupe: alerte.groupe_requis,
                statut: alerte.statut,
                lieu: alerte.lieu,
                description: alerte.description,
                createdAt: alerte.createdAt,
                initiateur: {
                    nom: alerte.initiateur.nom,
                    prenom: alerte.initiateur.prenom,
                    telephone: alerte.initiateur.telephone
                }
            },
            stats,
            // Only return donor details if the user is the initiator or admin
            details: (alerte.id_initiateur === userId || userRole === 'admin') ? alerte.notifications.map(n => ({
                donneur: `${n.destinataire.prenom} ${n.destinataire.nom}`,
                statut: n.statut_reception,
                telephone: n.destinataire.telephone
            })) : [] // Return empty array if not authorized to see details
        });

    } catch (error) {
        logger.error("Erreur récup statut alerte:", { error: error.message, alertId: req.params.id });
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getUserAlerts = async (req, res) => {
    // id_utilisateur will now come from req.user.id, not req.query
    const id_utilisateur = req.user.id; // Get user ID from authenticated user

    try {
        const alerts = await Alerte.findAll({
            where: { id_initiateur: id_utilisateur },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: LogNotification,
                    as: 'notifications',
                }
            ]
        });

        res.json({
            success: true,
            alerts: alerts.map(a => ({
                id: a.id_alerte,
                groupe: a.groupe_requis,
                statut: a.statut,
                date: a.createdAt,
                notifiedCount: a.notifications.length,
                acceptedCount: a.notifications.filter(n => n.statut_reception === 'accepte').length
            }))
        });
    } catch (error) {
        logger.error("Erreur récup alertes utilisateur:", { error: error.message, userId: id_utilisateur });
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alerte = await Alerte.findByPk(id);
        if (!alerte) {
            return res.status(404).json({ success: false, message: "Alerte non trouvée" });
        }

        // Authorization check: Only initiator can cancel their alert
        if (alerte.id_initiateur !== userId) {
            return res.status(403).json({ success: false, message: "Vous ne pouvez annuler que vos propres alertes" });
        }

        // Soft delete - set statut to 'annulee'
        alerte.statut = 'annulee';
        await alerte.save();

        res.status(200).json({
            success: true,
            message: "Alerte annulée avec succès"
        });
    } catch (error) {
        logger.error("Erreur lors de l'annulation de l'alerte:", { error: error.message, alertId: id });
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const userId = req.user.id;

        const alerte = await Alerte.findByPk(id);
        if (!alerte) {
            return res.status(404).json({ success: false, message: "Alerte non trouvée" });
        }

        // Authorization check: Only initiator can update their alert
        if (alerte.id_initiateur !== userId) {
            return res.status(403).json({ success: false, message: "Vous ne pouvez mettre à jour que vos propres alertes" });
        }

        // Validate status value
        const validStatuses = ['en_cours', 'satisfaite', 'annulee'];
        if (statut && !validStatuses.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: `Le statut doit être l'un de: ${validStatuses.join(', ')}`
            });
        }

        if (statut) {
            alerte.statut = statut;
            await alerte.save();
        }

        res.status(200).json({
            success: true,
            message: "Alerte mise à jour avec succès",
            alerte: {
                id: alerte.id_alerte,
                statut: alerte.statut,
                groupe: alerte.groupe_requis
            }
        });
    } catch (error) {
        logger.error("Erreur lors de la mise à jour de l'alerte:", { error: error.message, alertId: id });
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.respondToAlert = async (req, res) => {
    try {
        const { id } = req.params; // Alert ID
        const { response } = req.body; // 'accepte' or 'ignore'
        const userId = req.user.id;

        if (!['accepte', 'ignore'].includes(response)) {
            return res.status(400).json({ success: false, message: "Réponse invalide. Utilisez 'accepte' ou 'ignore'." });
        }

        const notification = await LogNotification.findOne({
            where: { id_alerte: id, id_utilisateur: userId }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Vous n'êtes pas concerné par cette alerte." });
        }

        notification.statut_reception = response;
        await notification.save();

        logger.info('User responded to alert', { userId, alertId: id, response });

        res.json({
            success: true,
            message: response === 'accepte' ? "Merci pour votre engagement !" : "Réponse enregistrée",
            statut: notification.statut_reception
        });
    } catch (error) {
        logger.error('Error responding to alert', { error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAcceptedAlerts = async (req, res) => {
    try {
        const userId = req.user.id;

        const acceptedNotifications = await LogNotification.findAll({
            where: {
                id_utilisateur: userId,
                statut_reception: 'accepte'
            },
            include: [{
                model: Alerte,
                as: 'alerte',
                include: [{
                    model: Utilisateur,
                    as: 'initiateur',
                    attributes: ['nom', 'prenom', 'telephone']
                }]
            }],
            order: [['date_envoi', 'DESC']]
        });

        res.json({
            success: true,
            alerts: acceptedNotifications.map(n => ({
                id: n.alerte.id_alerte,
                groupe: n.alerte.groupe_requis,
                statut: n.alerte.statut,
                date: n.alerte.createdAt,
                lieu: n.alerte.lieu,
                initiateur: `${n.alerte.initiateur.prenom} ${n.alerte.initiateur.nom}`,
                telephone_initiateur: n.alerte.initiateur.telephone
            }))
        });
    } catch (error) {
        logger.error('Error fetching accepted alerts', { error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
};
