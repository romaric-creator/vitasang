const db = require("../models");
const Alerte = db.Alerte;
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const LogNotification = db.LogNotification;
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
    const { latitude, longitude, bloodType, radius, degree, poches, id_initiateur } = req.body;

    try {
        // 1. Enregistrer l'alerte
        const alerte = await Alerte.create({
            groupe_requis: bloodType,
            degre_urgence: degree || "Normal",
            rayon_action_km: radius || 10,
            id_initiateur: id_initiateur || null,
            statut: "en_cours"
        });

        // 2. Trouver les donneurs compatibles
        const compatibleGroups = Object.keys(bloodCompatibility).filter(group =>
            bloodCompatibility[group].includes(bloodType)
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

        for (const donor of donors) {
            if (donor.profilDonneur && donor.profilDonneur.lat_actuelle && donor.profilDonneur.long_actuelle) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    donor.profilDonneur.lat_actuelle,
                    donor.profilDonneur.long_actuelle
                );

                if (distance <= (radius || 10)) {
                    // 3. Préparer la notification push si le token existe
                    if (donor.token_firebase && Expo.isExpoPushToken(donor.token_firebase)) {
                        messages.push({
                            to: donor.token_firebase,
                            sound: 'default',
                            body: `Urgence sang ${bloodType} à ${distance.toFixed(2)} km de votre position !`,
                            data: { alertId: alerte.id_alerte, bloodType, distance: distance.toFixed(2) },
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
                        username: donor.nom, // Changed from 'nom' to 'username' for consistency with frontend
                        distance: distance.toFixed(2)
                    });
                }
            }
        }

        // 5. Envoyer toutes les notifications en une seule fois
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                    // NOTE: If a ticket contains an error code in ticket.details.error, you
                    // must handle it appropriately. The error codes are listed in the Expo
                    // documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                } catch (error) {
                    console.error(`Error sending push notification chunk: ${error}`);
                }
            }
        })();

        res.status(201).json({
            success: true,
            message: `${notifiedDonors.length} donneurs ont été notifiés.`,
            alertId: alerte.id_alerte,
            donorsCount: notifiedDonors.length,
            notifiedDonors: notifiedDonors // Changed from 'donors' to 'notifiedDonors' for consistency
        });

    } catch (error) {
        console.error("Erreur lors de la création de l'alerte:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'alerte",
            error: error.message
        });
    }
};

exports.getAlertStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const alerte = await Alerte.findByPk(id, {
            include: [
                {
                    model: LogNotification,
                    as: 'notifications',
                    include: [{ model: Utilisateur, as: 'destinataire', attributes: ['nom', 'prenom', 'telephone'] }]
                }
            ]
        });

        if (!alerte) {
            return res.status(404).json({ success: false, message: "Alerte non trouvée" });
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
                createdAt: alerte.createdAt
            },
            stats,
            details: alerte.notifications.map(n => ({
                donneur: `${n.destinataire.prenom} ${n.destinataire.nom}`,
                statut: n.statut_reception,
                telephone: n.destinataire.telephone
            }))
        });

    } catch (error) {
        console.error("Erreur récup statut alerte:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getUserAlerts = async (req, res) => {
    const { id_utilisateur } = req.query;

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
        console.error("Erreur récup alertes utilisateur:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
