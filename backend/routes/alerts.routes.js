const express = require("express");
const router = express.Router();
const alertsController = require("../controllers/alerts.controller");

router.post("/search", alertsController.createAlertAndNotify);
router.get("/:id/status", alertsController.getAlertStatus);
router.get("/my-alerts", alertsController.getUserAlerts);

module.exports = router;
