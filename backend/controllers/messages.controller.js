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

        logger.info("Message sent", { from: senderId, to: id_destinataire });

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
        const conversations = await db.sequelize.query(
            `SELECT m.*, 
        u.nom, u.prenom, u.photo_profil,
        (SELECT COUNT(*) FROM Messages WHERE id_expediteur = partner_id AND id_destinataire = :userId AND est_lu = false) as unread_count
      FROM (
        SELECT *,
          CASE WHEN id_expediteur = :userId THEN id_destinataire ELSE id_expediteur END as partner_id,
          ROW_NUMBER() OVER (PARTITION BY 
            CASE WHEN id_expediteur = :userId THEN id_destinataire ELSE id_expediteur END 
            ORDER BY createdAt DESC
          ) as rn
        FROM Messages
        WHERE id_expediteur = :userId OR id_destinataire = :userId
      ) m
      JOIN Utilisateurs u ON u.id_utilisateur = m.partner_id
      WHERE m.rn = 1
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
