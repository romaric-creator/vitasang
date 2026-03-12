const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const LogNotification = db.LogNotification;
const logger = require("../config/logger");
const { calculateDistance } = require("../utils/geoHelpers");
const axios = require("axios");

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

exports.createAlertAndNotify = async (req, res, next) => {
    const { latitude, longitude, groupe_sanguin, radius, urgence, quantite_requise, lieu, description } = req.body;
    const id_initiateur = req.user.id;

    try {
        logger.info('Creating alert', { userId: id_initiateur, groupe_sanguin, latitude, longitude, radius });

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

        const compatibleGroups = Object.keys(bloodCompatibility).filter(group =>
            bloodCompatibility[group].includes(groupe_sanguin)
        );

        const donors = await Utilisateur.findAll({
            where: { role: 'donneur' },
            include: [{
                model: ProfilDonneur,
                as: 'profilDonneur',
                where: { groupe_sanguin: compatibleGroups }
            }]
        });

        let messages = [];
        const notifiedDonors = [];
        let donorsInRadius = 0;
        let donorsWithToken = 0;

        for (const donor of donors) {
            if (donor.profilDonneur && donor.profilDonneur.lat_actuelle !== null && donor.profilDonneur.long_actuelle !== null) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    donor.profilDonneur.lat_actuelle,
                    donor.profilDonneur.long_actuelle
                );

                if (distance <= (radius || 10)) {
                    donorsInRadius++;

                    if (donor.push_token) {
                        donorsWithToken++;
                        messages.push({
                            to: donor.push_token,
                            sound: 'default',
                            title: 'Urgence Sang',
                            body: `Urgence sang ${groupe_sanguin} à ${distance.toFixed(2)} km de votre position !`,
                            data: { alertId: alerte.id_alerte, groupe_sanguin, distance: distance.toFixed(2) },
                        });

                        await LogNotification.create({
                            id_utilisateur: donor.id_utilisateur,
                            id_alerte: alerte.id_alerte,
                            canal: 'push',
                            statut_reception: 'envoye'
                        });

                    } else {
                        await LogNotification.create({
                            id_utilisateur: donor.id_utilisateur,
                            id_alerte: alerte.id_alerte,
                            canal: 'push',
                            statut_reception: 'no_token'
                        });
                    }

                    notifiedDonors.push({
                        id: donor.id_utilisateur,
                        username: donor.nom,
                        distance: distance.toFixed(2)
                    });
                }
            }
        }

        if (messages.length > 0) {
            try {
                const response = await axios.post("https://exp.host/--/api/v2/push/send", messages, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    }
                });
                logger.info('Notifications batch sent directly to Expo API', {
                    count: messages.length,
                    expoResponse: response.data
                });
            } catch (error) {
                logger.error('Error sending Axios push notifications to Expo API', {
                    error: error.message,
                    responseData: error.response ? error.response.data : null
                });
            }
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
            notifiedDonors
        });

    } catch (error) {
        logger.error('Error creating alert', { error: error.message, userId: id_initiateur });
        next(error);
    }
};

exports.getAlertStatus = async (req, res, next) => {
    const { id } = req.params; 
    const userId = req.user.id; 
    const userRole = req.user.role; 

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

        const isInitiator = alerte.id_initiateur === userId;
        const isAdmin = userRole === 'admin';
        const isNotified = alerte.notifications.some(n => n.id_utilisateur === userId);

        if (!isInitiator && !isAdmin && !isNotified) {
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
            details: (isInitiator || isAdmin) ? alerte.notifications.map(n => ({
                donneur: `${n.destinataire.prenom} ${n.destinataire.nom}`,
                statut: n.statut_reception,
                telephone: n.destinataire.telephone
            })) : [] 
        });

    } catch (error) {
        logger.error("Erreur récup statut alerte:", { error: error.message, alertId: req.params.id });
        next(error);
    }
};

exports.getUserAlerts = async (req, res, next) => {
    const id_utilisateur = req.user.id; 

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
        next(error);
    }
};

exports.deleteAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alerte = await Alerte.findByPk(id);
        if (!alerte) {
            return res.status(404).json({ success: false, message: "Alerte non trouvée" });
        }

        if (alerte.id_initiateur !== userId) {
            return res.status(403).json({ success: false, message: "Vous ne pouvez annuler que vos propres alertes" });
        }

        alerte.statut = 'annulee';
        await alerte.save();

        res.status(200).json({
            success: true,
            message: "Alerte annulée avec succès"
        });
    } catch (error) {
        logger.error("Erreur lors de l'annulation de l'alerte:", { error: error.message, alertId: id });
        next(error);
    }
};

exports.updateAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const userId = req.user.id;

        const alerte = await Alerte.findByPk(id);
        if (!alerte) {
            return res.status(404).json({ success: false, message: "Alerte non trouvée" });
        }

        if (alerte.id_initiateur !== userId) {
            return res.status(403).json({ success: false, message: "Vous ne pouvez mettre à jour que vos propres alertes" });
        }

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
        next(error);
    }
};

exports.respondToAlert = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const { response } = req.body; 
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
        next(error);
    }
};

exports.getAcceptedAlerts = async (req, res, next) => {
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
        next(error);
    }
};

exports.getAllActiveAlerts = async (req, res, next) => {
    try {
        const alerts = await Alerte.findAll({
            where: { statut: 'en_cours' },
            include: [{
                model: Utilisateur,
                as: 'initiateur',
                attributes: ['nom', 'prenom', 'telephone']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            alerts: alerts.map(a => ({
                id: a.id_alerte,
                groupe: a.groupe_requis,
                statut: a.statut,
                date: a.createdAt,
                lieu: a.lieu,
                urgence: a.degre_urgence,
                initiateur: `${a.initiateur.prenom} ${a.initiateur.nom}`,
                telephone_initiateur: a.initiateur.telephone,
                quantite_requise: a.quantite_requise
            }))
        });
    } catch (error) {
        logger.error('Error fetching active alerts', { error: error.message });
        next(error);
    }
};