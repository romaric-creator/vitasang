const express = require("express");
const router = express.Router();
const controller = require("../controllers/messages.controller");
const { verifyToken } = require("../utils/auth.middleware");

// All message routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a direct message to another user
 *     security: [{"bearerAuth": []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_destinataire, contenu]
 *             properties:
 *               id_destinataire:
 *                 type: integer
 *                 example: 42
 *               contenu:
 *                 type: string
 *                 example: "Bonjour, je suis disponible pour donner."
 *     responses:
 *       201: { description: "Message sent" }
 *       400: { description: "Validation error" }
 */
router.post("/", controller.sendMessage);

/**
 * @swagger
 * /api/messages/inbox:
 *   get:
 *     tags: [Messages]
 *     summary: Get inbox (all conversations summary)
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: "List of conversations" }
 */
router.get("/inbox", controller.getInbox);

/**
 * @swagger
 * /api/messages/{otherId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get conversation with a specific user
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - { name: "otherId", in: "path", required: true, schema: { type: "integer" } }
 *       - { name: "page", in: "query", schema: { type: "integer", default: 1 } }
 *       - { name: "limit", in: "query", schema: { type: "integer", default: 30 } }
 *     responses:
 *       200: { description: "Conversation messages" }
 */
router.get("/:otherId", controller.getConversation);

module.exports = router;
