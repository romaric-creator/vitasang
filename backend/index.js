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

// Sentry Integration - MUST be initialized as early as possible
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

const app = express();

app.set("trust proxy", 1); // Indispensable pour Vercel et express-rate-limit
app.use(helmet());

// Sentry Request Handler - MUST be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// CORS Configuration - Whitelist security
const allowedOrigins = [
  "https://vitasang.vercel.app",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:5173", // Ajoutez cette ligne
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? allowedOrigins.filter((url) => url.startsWith("https"))
        : allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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
// This prevents double counting by allowing specific limiters to intercept these routes first
app.use("/api/users/register", registerLimiter);
app.use("/api/users/login", authLimiter);

// Apply global rate limiter to all other routes
app.use(globalLimiter);

app.use("/api/users", userRoute);
app.use("/api/alerts", alertRoute);
app.use("/api/rendez-vous", rendezvousRoute);
app.use("/api/centres", centresRoute);

// Route racine pour le "Home" du backend
app.get("/", (req, res) => {
  res.json({ message: "bienvenu sur vitasang.api.com", version: "1.0.0" });
});

// 404 Not Found Handler - MUST be after all routes
app.use(notFoundHandler);

// Sentry Error Handler - MUST be before any other error handling middleware
app.use(Sentry.Handlers.errorHandler());

// Global Error Handler - MUST be after all routes and middleware
app.use(errorHandler);

// Connexion à la base de données et démarrage du serveur (si non importé)
if (require.main === module) {
  db.sequelize
    .sync({ force: false })
    .then(() => {
      logger.info("MariaDB : Connexion réussie et tables synchronisées !");
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        logger.info(`Serveur VITASANG démarré sur : http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Erreur de synchronisation MariaDB :", err);
    });
}

// Export pour Vercel
module.exports = app;
