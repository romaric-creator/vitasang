const express = require("express");
const controller = require("../controllers/users.controller");
const { verifyToken, requireRole } = require("../utils/auth.middleware");
const { validateRequest } = require("../middleware/validation");
const upload = require("../middleware/upload");
const schemas = require("../validation/schemas");
const normalizePhoneNumber = require("../middleware/normalizePhone");
const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, telephone, mot_de_passe, groupe_sanguin]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Dupont
 *               prenom:
 *                 type: string
 *                 example: Jean
 *               telephone:
 *                 type: string
 *                 example: "+212612345678"
 *               mot_de_passe:
 *                 type: string
 *                 example: "SecurePass123"
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: O+
 *               ville:
 *                 type: string
 *                 example: "Casablanca"
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  normalizePhoneNumber,
  validateRequest(schemas.register),
  controller.addUser,
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with telephone and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [telephone, mot_de_passe]
 *             properties:
 *               telephone:
 *                 type: string
 *                 example: "+212612345678"
 *               mot_de_passe:
 *                 type: string
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  normalizePhoneNumber,
  validateRequest(schemas.login),
  controller.login,
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/", verifyToken, requireRole("admin"), controller.getAllUsers);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags:
 *       - Users
 *     summary: Search for donors
 *     parameters:
 *       - name: latitude
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: longitude
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: radius
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: groupe_sanguin
 *         in: query
 *         schema:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get(
  "/search",
  verifyToken,
  validateRequest(schemas.searchUsers),
  controller.searchUsers,
);

/**
 * @swagger
 * /api/users/groupe-sanguin/{groupe}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get users by blood group
 *     parameters:
 *       - name: groupe
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *     responses:
 *       200:
 *         description: Users with specified blood group
 */
router.get("/groupe-sanguin/:groupe", verifyToken, controller.getUsersByBloodGroup);

/**
 * @swagger
 * /api/users/{id}/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/:id/profile", verifyToken, controller.getUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/:id", verifyToken, controller.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
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
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               telephone:
 *                 type: string
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               ville:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user account
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
 *         description: Account deleted successfully
 *       403:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  verifyToken,
  validateRequest(schemas.updateUser),
  controller.updateUser,
);
router.delete("/:id", verifyToken, controller.deleteUser);

/**
 * @swagger
 * /api/users/{id}/history:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user donation history
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
 *         description: User donation history
 *       403:
 *         description: Unauthorized
 */
router.get("/:id/history", verifyToken, controller.getUserHistory);

/**
 * @swagger
 * /api/users/{id}/push-token:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update push notification token
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
 *               token:
 *                 type: string
 *                 example: "ExponentPushToken[xxxxxxxx...]"
 *     responses:
 *       200:
 *         description: Token updated successfully
 *       403:
 *         description: Unauthorized
 */
router.put(
  "/:id/push-token",
  verifyToken,
  validateRequest(schemas.pushToken),
  controller.updatePushToken,
);

/**
 * @swagger
 * /api/users/{id}/upload-photo:
 *   post:
 *     tags:
 *       - Users
 *     summary: Upload profile picture
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 */
router.post(
  "/:id/upload-photo",
  verifyToken,
  upload.single("photo"),
  controller.uploadProfilePicture,
);

module.exports = router;
