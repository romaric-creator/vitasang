const express = require('express');
const router = express.Router();
const controller = require('../controllers/campaigns.controller');
const { verifyToken, isAdminOrPersonnel } = require('../utils/auth.middleware');

// GET /api/v1/campaigns - Get campaign history for the center
router.get('/', verifyToken, isAdminOrPersonnel, controller.getCampaigns);

// POST /api/v1/campaigns - Create and launch a new campaign
router.post('/', verifyToken, isAdminOrPersonnel, controller.launchCampaign);

module.exports = router;
