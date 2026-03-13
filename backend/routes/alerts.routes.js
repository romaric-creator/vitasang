const express = require("express");
const router = express.Router();
const alertsController = require("../controllers/alerts.controller");
const { verifyToken } = require("../utils/auth.middleware");
const { validateRequest } = require("../middleware/validation");
const schemas = require("../validation/schemas");

/**
 * @swagger
 * /api/alerts/search:
 *   post:
 *     tags:
 *       - Alerts
 *     summary: Create a new blood donation alert
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [groupe_sanguin, urgence, lieu, latitude, longitude, quantite_requise]
 *             properties:
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: O+
 *               urgence:
 *                 type: string
 *                 enum: [NORMAL, URGENT, TRES_URGENT]
 *                 example: URGENT
 *               lieu:
 *                 type: string
 *                 example: "Hôpital Ibn Sina, Casablanca"
 *               latitude:
 *                 type: number
 *                 example: 33.5731
 *               longitude:
 *                 type: number
 *                 example: -7.5898
 *               quantite_requise:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *                 example: "Transfusion d'urgence"
 *     responses:
 *       201:
 *         description: Alert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 alerte:
 *                   $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
router.post(
  "/search",
  verifyToken,
  validateRequest(schemas.createAlert),
  alertsController.createAlertAndNotify,
);

/**
 * @swagger
 * /api/alerts/{id}/status:
 *   get:
 *     tags:
 *       - Alerts
 *     summary: Get alert status
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
 *         description: Alert status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerte:
 *                   $ref: '#/components/schemas/Alert'
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 */
router.get("/:id/status", verifyToken, alertsController.getAlertStatus);

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     tags:
 *       - Alerts
 *     summary: Delete/Cancel an alert
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
 *         description: Alert deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 *   put:
 *     tags:
 *       - Alerts
 *     summary: Update alert status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETE, CANCELLED]
 *     responses:
 *       200:
 *         description: Alert status updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 */
/**
 * @swagger
 * /api/alerts/my-alerts:
 *   get:
 *     tags:
 *       - Alerts
 *     summary: Get current user's alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alertes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 *       403:
 *         description: Unauthorized
 */
router.get("/my-alerts", verifyToken, alertsController.getUserAlerts);

/**
 * @swagger
 * /api/alerts/accepted:
 *   get:
 *     tags:
 *       - Alerts
 *     summary: Get alerts accepted by the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accepted alerts
 */
router.get("/accepted", verifyToken, alertsController.getAcceptedAlerts);

/**
 * @swagger
 * /api/alerts/active:
 *   get:
 *     tags:
 *       - Alerts
 *     summary: Get all active blood donation alerts (Public)
 *     responses:
 *       200:
 *         description: List of active alerts
 */
router.get("/active", alertsController.getAllActiveAlerts);

/**
 * @swagger
 * /api/alerts/{id}/status:
 *   get:
 *     tags:
 *       - Alerts
 *     summary: Get alert status
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
 *         description: Alert status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerte:
 *                   $ref: '#/components/schemas/Alert'
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 */
router.get("/:id/status", verifyToken, alertsController.getAlertStatus);

/**
 * @swagger
 * /api/alerts/{id}/respond:
 *   post:
 *     tags:
 *       - Alerts
 *     summary: Respond to an alert (accept/ignore)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [accepte, ignore]
 *     responses:
 *       200:
 *         description: Response registered
 */
router.post("/:id/respond", verifyToken, alertsController.respondToAlert);

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     tags:
 *       - Alerts
 *     summary: Delete/Cancel an alert
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
 *         description: Alert deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 *   put:
 *     tags:
 *       - Alerts
 *     summary: Update alert status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETE, CANCELLED]
 *     responses:
 *       200:
 *         description: Alert status updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 */
router.delete("/:id", verifyToken, alertsController.deleteAlert);
router.put(
  "/:id",
  verifyToken,
  validateRequest(schemas.updateAlert),
  alertsController.updateAlert,
);

module.exports = router;
