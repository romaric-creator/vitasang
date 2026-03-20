require("dotenv").config();

const mysql2 = require("mysql2"); // Importation forcée pour Vercel
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./models/index");
const logger = require("./config/logger");
const {
  globalLimiter,
  authLimiter,
  registerLimiter,
} = require("./middleware/rateLimiter");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Initialisation des tâches en arrière-plan
require("./jobs/cleanup.cron");

const app = express();

app.set("trust proxy", 1); // Indispensable pour Vercel et express-rate-limit
app.use(helmet());

// CORS Configuration - Whitelist security
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Toujours autoriser localhost peu importe l'environnement
      if (origin.includes("localhost")) {
        return callback(null, true);
      }

      // Vérifier la whitelist pour les autres origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      const msg = `CORS bloqué pour l'origine : ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(require('compression')());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Swagger API Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 1,
    },
  }),
);

const userRoute = require("./routes/users.routes");
const alertRoute = require("./routes/alerts.routes");
const rendezvousRoute = require("./routes/rendezvous.routes");
const centresRoute = require("./routes/centres.routes");

// Apply specific rate limiters to auth endpoints BEFORE global limiter
app.use("/api/v1/users/register", registerLimiter);
app.use("/api/v1/users/login", authLimiter);

// Apply global rate limiter to all other routes
app.use(globalLimiter);

app.use("/api/v1/users", userRoute);
app.use("/api/v1/alerts", alertRoute);
app.use("/api/v1/rendez-vous", rendezvousRoute);
app.use("/api/v1/centres", centresRoute);

// Route racine pour le "Home" du backend
app.get("/", (req, res) => {
  res.json({ message: "bienvenu sur vitasang.api.com", version: "1.0.0" });
});

// 404 Not Found Handler - MUST be after all routes
app.use(notFoundHandler);

// Global Error Handler - MUST be after all routes and middleware
app.use(errorHandler);

// Connexion à la base de données et démarrage du serveur (si non importé)
if (require.main === module) {
  db.sequelize
    .authenticate()
    .then(() => {
      logger.info("MariaDB : Connexion réussie et tables synchronisées !");
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Serveur VITASANG démarré sur : http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Erreur de connexion MariaDB :", err);
    });
}

// Export pour Vercel
module.exports = app;
