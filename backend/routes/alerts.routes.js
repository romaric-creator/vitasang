const express = require("express");
const router = express.Router();
const alertsController = require("../controllers/alerts.controller");
const {
  verifyToken,
  isAdmin,
  isAdminOrPersonnel,
} = require("../utils/auth.middleware");
const { validateRequest } = require("../middleware/validation");
const { cacheMiddleware } = require("../middleware/cache");
const schemas = require("../validation/schemas");

/**
 * PUBLIC ROUTE - Get all live (en_cours) blood donation alerts
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

/**
 * PUBLIC ROUTE - Get a specific alert's status and details
 */
router.get("/:id/status", alertsController.getAlertStatus);

// --- PROTECTED ROUTES (Requires Token) ---
router.use(verifyToken);

/**
 * Create a new blood donation alert
 */
router.post(
  "/",
  validateRequest(schemas.createAlert),
  alertsController.createAlert,
);

/**
 * Validate a pending alert and notify donors
 */
router.post(
  "/:id/validate",
  isAdminOrPersonnel,
  alertsController.validateAndNotifyAlert,
);

/**
 * Get all alerts pending validation (Admin only)
 */
router.get("/pending", isAdmin, alertsController.getPendingAlerts);

/**
 * Get current user's created alerts
 */
router.get("/my-alerts", alertsController.getUserAlerts);

/**
 * Find alerts near a locations
 */
router.get(
  "/nearby",
  validateRequest(schemas.nearbyAlerts),
  alertsController.getNearbyAlerts,
);

/**
 * Respond to an alert (as a donor)
 */
router.post("/:id/respond", alertsController.respondToAlert);

/**
 * Confirm donation completed (by the donor)
 */
router.post("/:id/confirm", alertsController.confirmDonation);

/**
 * Cancel or delete an alert
 */
router.delete("/:id", alertsController.deleteAlert);

module.exports = router;
