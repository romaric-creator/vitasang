const db = require("../models");
const Message = db.Message;
const Utilisateur = db.Utilisateur;
const logger = require("../config/logger");

/**
 * Controller for direct messaging between users (donor <-> alert initiator)
 */

// Send a message
exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { id_destinataire, contenu } = req.body;

        if (!id_destinataire || !contenu) {
            return res.status(400).json({ message: "id_destinataire et contenu sont requis." });
        }

        if (contenu.length > 1000) {
            return res.status(400).json({ message: "Le message est trop long (max 1000 caractères)." });
        }

        // Verify recipient exists
        const recipient = await Utilisateur.findByPk(id_destinataire);
        if (!recipient) {
            return res.status(404).json({ message: "Destinataire non trouvé." });
        }

        const message = await Message.create({
            id_expediteur: senderId,
            id_destinataire: parseInt(id_destinataire),
            contenu,
        });

        const { notificationQueue } = require("../jobs/notification.queue");
        await notificationQueue.add("sendMessageNotification", {
            senderId,
            recipientId: parseInt(id_destinataire),
            contenu: contenu.substring(0, 50),
            senderName: `${req.user.prenom} ${req.user.nom}`
        });

        logger.info("Message sent and notification queued", { from: senderId, to: id_destinataire });

        res.status(201).json({
            success: true,
            message: "Message envoyé avec succès.",
            data: message,
        });
    } catch (error) {
        logger.error("Error sending message", { error: error.message });
        next(error);
    }
};

// Get conversation between two users
exports.getConversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { otherId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const offset = (page - 1) * limit;

        const messages = await Message.findAndCountAll({
            where: {
                [db.Sequelize.Op.or]: [
                    { id_expediteur: userId, id_destinataire: parseInt(otherId) },
                    { id_expediteur: parseInt(otherId), id_destinataire: userId },
                ],
            },
            include: [
                { model: Utilisateur, as: "expediteur", attributes: ["id_utilisateur", "nom", "prenom", "photo_profil"] },
                { model: Utilisateur, as: "destinataire", attributes: ["id_utilisateur", "nom", "prenom", "photo_profil"] },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        // Mark unread messages as read
        await Message.update(
            { est_lu: true },
            {
                where: {
                    id_expediteur: parseInt(otherId),
                    id_destinataire: userId,
                    est_lu: false,
                },
            },
        );

        res.status(200).json({
            success: true,
            messages: messages.rows.reverse(),
            total: messages.count,
            totalPages: Math.ceil(messages.count / limit),
            currentPage: page,
        });
    } catch (error) {
        logger.error("Error fetching conversation", { error: error.message });
        next(error);
    }
};

// Get all conversations (inbox)
exports.getInbox = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get the latest message from each unique conversation partner
        // Compatible with MySQL 5.7 (replaces ROW_NUMBER() window function)
        const conversations = await db.sequelize.query(
            `SELECT m.*, 
                u.nom, u.prenom, u.photo_profil,
                (SELECT COUNT(*) FROM Messages WHERE id_expediteur = m.partner_id AND id_destinataire = :userId AND est_lu = 0) as unread_count
             FROM (
                SELECT m1.*,
                    CASE WHEN m1.id_expediteur = :userId THEN m1.id_destinataire ELSE m1.id_expediteur END as partner_id
                FROM Messages m1
                JOIN (
                    SELECT 
                        CASE WHEN id_expediteur = :userId THEN id_destinataire ELSE id_expediteur END as partner,
                        MAX(createdAt) as max_date
                    FROM Messages
                    WHERE id_expediteur = :userId OR id_destinataire = :userId
                    GROUP BY partner
                ) m2 ON (CASE WHEN m1.id_expediteur = :userId THEN m1.id_destinataire ELSE m1.id_expediteur END) = m2.partner 
                   AND m1.createdAt = m2.max_date
             ) m
             JOIN Utilisateurs u ON u.id_utilisateur = m.partner_id
             ORDER BY m.createdAt DESC`,
            {
                replacements: { userId },
                type: db.Sequelize.QueryTypes.SELECT,
            },
        );
        res.status(200).json({ success: true, conversations });
    } catch (error) {
        logger.error("Error fetching inbox", { error: error.message });
        next(error);
    }
};
