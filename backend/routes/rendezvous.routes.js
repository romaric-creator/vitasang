const express = require("express");
const router = express.Router();
const controller = require("../controllers/rendezvous.controller");
const { verifyToken } = require("../utils/auth.middleware");
const { validateRequest } = require("../middleware/validation");
const schemas = require("../validation/schemas");

/**
 * @swagger
 * /api/rendez-vous:
 *   post:
 *     tags:
 *       - Rendez-Vous
 *     summary: Create a new rendez-vous (appointment)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_centre, date_rdv, heure_debut]
 *             properties:
 *               id_centre:
 *                 type: integer
 *                 example: 1
 *               date_rdv:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-15"
 *               heure_debut:
 *                 type: string
 *                 example: "09:00"
 *               id_type_don:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Rendez-vous created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, validateRequest(schemas.createRendezvous), controller.createRendezVous);

/**
 * @swagger
 * /api/rendez-vous/my-appointments:
 *   get:
 *     tags:
 *       - Rendez-Vous
 *     summary: Get user's rendez-vous
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's rendez-vous
 */
router.get("/my-appointments", verifyToken, controller.getUserRendezVous);

/**
 * @swagger
 * /api/rendez-vous/{id}:
 *   get:
 *     tags:
 *       - Rendez-Vous
 *     summary: Get rendez-vous details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rendez-vous details
 *       404:
 *         description: Not found
 *   delete:
 *     tags:
 *       - Rendez-Vous
 *     summary: Cancel a rendez-vous
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rendez-vous cancelled
 *       403:
 *         description: Unauthorized
 */
router.get("/:id", verifyToken, controller.getRendezVousDetail);
router.delete("/:id", verifyToken, controller.cancelRendezVous);

module.exports = router;
