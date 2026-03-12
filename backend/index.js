require('dotenv').config();
const mysql2 = require('mysql2'); // Importation forcée pour Vercel
const express = require("express");
const cors = require("cors");
const morgan = require("morgan")
const db = require('./models/index');
const logger = require('./config/logger');
const { globalLimiter, authLimiter, registerLimiter } = require('./middleware/rateLimiter');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

app.set('trust proxy', 1); // Indispensable pour Vercel et express-rate-limit
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: 1
    }
}));

// Apply global rate limiter to all routes
app.use(globalLimiter);

const userRoute = require("./routes/users.routes");
const alertRoute = require("./routes/alerts.routes");
const rendezvousRoute = require("./routes/rendezvous.routes");
const centresRoute = require("./routes/centres.routes");

// Apply specific rate limiters to auth endpoints
app.use("/api/users/register", registerLimiter);
app.use("/api/users/login", authLimiter);

app.use("/api/users", userRoute);
app.use("/api/alerts", alertRoute);
app.use("/api/rendez-vous", rendezvousRoute);
app.use("/api/centres", centresRoute);

// Route racine pour le "Home" du backend
app.get("/", (req, res) => {
    res.json({ message: "Welcome to VitaSang API", status: "online", version: "1.0.0" });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    logger.error('Erreur non gérée', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(err.statusCode || 500).json({
        message: err.message || "Une erreur interne du serveur est survenue.",
        details: process.env.NODE_ENV === 'development' ? err.stack : {} // N'expose pas le stack en production
    });
});

// Connexion à la base de données et démarrage du serveur (si non importé)
if (require.main === module) {
    db.sequelize.sync({ force: false })
        .then(() => {
            logger.info("MariaDB : Connexion réussie et tables synchronisées !");
            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => {
                logger.info(`Serveur VITASANG démarré sur : http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            logger.error("Erreur de synchronisation MariaDB :", err);
        });
}

// Export pour Vercel
module.exports = app;