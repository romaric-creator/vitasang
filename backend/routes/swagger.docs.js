/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Verify API is running and database is connected
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: API or database is unavailable
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User registration and login
 *   - name: Users
 *     description: User profile management
 *   - name: Alerts
 *     description: Blood donation alerts
 *   - name: Rendez-vous
 *     description: Appointment management
 *   - name: Centres
 *     description: Blood donation centres
 *   - name: Health
 *     description: API health status
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Erreur de validation"
 *         errors:
 *           type: object
 *           properties:
 *             fieldName:
 *               type: string
 *               example: "Le message d'erreur pour ce champ"
 *       example:
 *         message: "Erreur de validation"
 *         errors:
 *           telephone: "Format: +237 6XXXXXXXX ou 2XXXXXXXX..."
 *           mot_de_passe: "Au minimum 6 caractères"
 *     
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Non autorisé"
 *         error:
 *           type: string
 *           example: "Invalid token"
 *     
 *     NotFoundError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Ressource non trouvée"
 *     
 *     ServerError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Erreur serveur interne"
 *         details:
 *           type: object
 *   
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: "JWT token obtained from /api/users/login"
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     operationId: registerUser
 *     summary: Register a new user
 *     description: Create a new user account. Role defaults to 'donneur'
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - telephone
 *               - mot_de_passe
 *               - groupe_sanguin
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Jean"
 *               telephone:
 *                 type: string
 *                 pattern: "^(\\+237[26]\\d{8}|[26]\\d{8})$"
 *                 example: "+237612345678"
 *               mot_de_passe:
 *                 type: string
 *                 minLength: 6
 *                 example: "SecurePass123"
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: "O+"
 *               role:
 *                 type: string
 *                 enum: [donneur, personnel, admin]
 *                 default: "donneur"
 *               ville:
 *                 type: string
 *                 example: "Casablanca"
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
 *                   example: "Donneur créé avec succès"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     operationId: loginUser
 *     summary: User login
 *     description: Authenticate user with telephone and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telephone
 *               - mot_de_passe
 *             properties:
 *               telephone:
 *                 type: string
 *                 example: "+237612345678"
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     operationId: getAllUsers
 *     summary: Get all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     operationId: getUserById
 *     summary: Get user by ID
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     operationId: updateUser
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
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
 *               ville:
 *                 type: string
 *               groupe_sanguin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *   delete:
 *     operationId: deleteUser
 *     summary: Delete user account
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account deleted
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/users/{id}/history:
 *   get:
 *     operationId: getUserHistory
 *     summary: Get donation history
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donation history
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/alerts/search:
 *   post:
 *     operationId: createAlert
 *     summary: Create blood donation alert
 *     tags:
 *       - Alerts
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - groupe_sanguin
 *               - urgence
 *               - lieu
 *               - quantite_requise
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 33.5731
 *               longitude:
 *                 type: number
 *                 example: -7.5898
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               urgence:
 *                 type: string
 *                 enum: [NORMAL, URGENT, TRES_URGENT]
 *               lieu:
 *                 type: string
 *                 example: "Hôpital Ibn Sina, Casablanca"
 *               quantite_requise:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               radius:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/centres:
 *   get:
 *     operationId: getAllCentres
 *     summary: Get all blood centres
 *     tags:
 *       - Centres
 *     responses:
 *       200:
 *         description: List of all centres
 */

/**
 * @swagger
 * /api/centres/search:
 *   get:
 *     operationId: searchCentres
 *     summary: Search nearby centres
 *     tags:
 *       - Centres
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
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Nearby centres
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/rendez-vous:
 *   post:
 *     operationId: createRendezvous
 *     summary: Create appointment
 *     tags:
 *       - Rendez-vous
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_centre
 *               - date_rendezvous
 *               - heure_debut
 *             properties:
 *               id_centre:
 *                 type: integer
 *               date_rendezvous:
 *                 type: string
 *                 format: date
 *               heure_debut:
 *                 type: string
 *                 example: "09:00"
 *     responses:
 *       201:
 *         description: Appointment created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/rendez-vous/my-appointments:
 *   get:
 *     operationId: getUserAppointments
 *     summary: Get my appointments
 *     tags:
 *       - Rendez-vous
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user appointments
 *       401:
 *         description: Unauthorized
 */

module.exports = {};
