const express = require("express");
const router = express.Router();
const alertsController = require("../controllers/alerts.controller");
const { verifyToken, requireRole } = require("../utils/auth.middleware");
const { validateRequest } = require("../middleware/validation");
const { cacheMiddleware } = require("../middleware/cache");
const schemas = require("../validation/schemas");

const isAdmin = requireRole("admin");

/**
 * PUBLIC ROUTE - Get all live (en_cours) blood donation alerts
 * No authentication required - anyone can see active alerts
 */
router.get("/public", cacheMiddleware(5 * 60), alertsController.getLiveAlerts);

/**
 * PUBLIC ROUTE - Create an emergency alert as a guest (non-registered)
 */
router.post(
  "/guest",
  validateRequest(schemas.createGuestAlert),
  alertsController.createGuestAlert,
);

// The verifyToken middleware will be used for all routes defined after this line.

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     tags: [Alerts]
 *     summary: Create a new blood donation alert (pending validation)
 *     security: [{"bearerAuth": []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlert'
 *     responses:
 *       201: { description: "Alert created and awaiting validation" }
 *       400: { description: "Validation error" }
 */
router.post(
  "/",
  verifyToken,
  validateRequest(schemas.createAlert),
  alertsController.createAlert,
);

/**
 * @swagger
 * /api/alerts/{id}/validate:
 *   post:
 *     tags: [Alerts]
 *     summary: Validate a pending alert and notify donors
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - { name: "id", in: "path", required: true, schema: { type: "integer" } }
 *     responses:
 *       200: { description: "Alert validated and notifications sent" }
 *       403: { description: "Forbidden - Admins only" }
 *       404: { description: "Alert not found" }
 */
router.post(
  "/:id/validate",
  requireRole(["admin", "personnel"]), // Personnel and admins can validate
  alertsController.validateAndNotifyAlert,
);

/**
 * @swagger
 * /api/alerts/pending:
 *   get:
 *     tags: [Alerts]
 *     summary: Get all alerts pending validation
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: "List of pending alerts" }
 */
router.get("/pending", requireRole("admin"), alertsController.getPendingAlerts);

/**
 * @swagger
 * /api/alerts/live:
 *   get:
 *     tags: [Alerts]
 *     summary: Get all live (en_cours) blood donation alerts
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: "List of live alerts" }
 */
router.get("/live", cacheMiddleware(5 * 60), alertsController.getLiveAlerts);

/**
 * @swagger
 * /api/alerts/my-alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: Get current user's created alerts
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: "User's alerts" }
 */
router.get("/my-alerts", alertsController.getUserAlerts);

/**
 * @swagger
 * /api/alerts/accepted:
 *   get:
 *     tags: [Alerts]
 *     summary: Get alerts accepted by the current user
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: "List of accepted alerts" }
 */
router.get("/accepted", alertsController.getAcceptedAlerts);

/**
 * @swagger
 * /api/alerts/{id}/status:
 *   get:
 *     tags: [Alerts]
 *     summary: Get a specific alert's status and details
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - { name: "id", in: "path", required: true, schema: { type: "integer" } }
 *     responses:
 *       200: { description: "Alert details" }
 *       404: { description: "Alert not found" }
 */
router.get("/:id/status", alertsController.getAlertStatus);

/**
 * @swagger
 * /api/alerts/{id}/respond:
 *   post:
 *     tags: [Alerts]
 *     summary: Respond to an alert (as a donor)
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - { name: "id", in: "path", required: true, schema: { type: "integer" } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { response: { type: "string", enum: [accepte, ignore] } }
 *     responses:
 *       200: { description: "Response registered" }
 */
router.post("/:id/respond", alertsController.respondToAlert);

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     tags: [Alerts]
 *     summary: Update an alert (e.g., description, quantity)
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - { name: "id", in: "path", required: true, schema: { type: "integer" } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAlert'
 *     responses:
 *       200: { description: "Alert updated successfully" }
 *       404: { description: "Alert not found" }
 *   delete:
 *     tags: [Alerts]
 *     summary: Cancel or delete an alert
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - { name: "id", in: "path", required: true, schema: { type: "integer" } }
 *     responses:
 *       200: { description: "Alert cancelled successfully" }
 *       404: { description: "Alert not found" }
 */
router.put(
  "/:id",
  validateRequest(schemas.updateAlert),
  alertsController.updateAlert,
);
router.delete("/:id", alertsController.deleteAlert);

module.exports = router;
