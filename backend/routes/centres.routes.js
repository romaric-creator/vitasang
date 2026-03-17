const express = require("express");
const router = express.Router();
const controller = require("../controllers/centres.controller");
const { verifyToken } = require("../utils/auth.middleware");
const { validateRequest } = require("../middleware/validation");
const schemas = require("../validation/schemas");

/**
 * @swagger
 * /api/centres:
 *   get:
 *     tags:
 *       - Centres
 *     summary: Get all blood donation centres
 *     responses:
 *       200:
 *         description: List of all centres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 centres:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_centre:
 *                         type: integer
 *                       nom:
 *                         type: string
 *                       adresse:
 *                         type: string
 *                       telephone:
 *                         type: string
 *                       email:
 *                         type: string
 */
router.get("/", controller.getAllCentres);

/**
 * @swagger
 * /api/centres/search:
 *   get:
 *     tags:
 *       - Centres
 *     summary: Search centres nearby
 *     parameters:
 *       - name: latitude
 *         in: query
 *         schema:
 *           type: number
 *       - name: longitude
 *         in: query
 *         schema:
 *           type: number
 *       - name: radius
 *         in: query
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Nearby centres
 */
router.get("/search", validateRequest(schemas.searchCentres), controller.searchCentresNearby);

/**
 * @swagger
 * /api/centres/{id}:
 *   get:
 *     tags:
 *       - Centres
 *     summary: Get centre details
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Centre details
 *       404:
 *         description: Not found
 */
router.get("/:id", controller.getCentreDetail);

/**
 * @swagger
 * /api/centres/{id}/availability:
 *   get:
 *     tags:
 *       - Centres
 *     summary: Get centre availability slots
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available time slots
 */
router.get("/:id/availability", controller.getCentreAvailability);

module.exports = router;
