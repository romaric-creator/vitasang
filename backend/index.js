require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const Sentry = require("@sentry/node");
const db = require("./models/index");
const logger = require("./config/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const {
  globalLimiter,
  authLimiter,
  registerLimiter,
  alertLimiter,
} = require("./middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { verifyToken, isAdmin } = require("./utils/auth.middleware");

// Validation des variables d'environnement critiques (production uniquement)
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET', 'DB_USER', 'DB_PASS'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }
}

// Initialisation Sentry - vérifier si le package est bien chargé
let sentryEnabled = false;
try {
  sentryEnabled = !!(process.env.SENTRY_DSN && Sentry.Handlers);
  if (sentryEnabled) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 0.1,
    });
    console.log("Sentry initialisé avec succès");
  }
} catch (err) {
  console.log("Sentry non configuré:", err.message);
}

// Initialisation des tâches en arrière-plan
require("./jobs/cleanup.cron");
require("./jobs/notification.queue");

const app = express();

const corsOriginEnv = process.env.CORS_ORIGIN || "";
const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://vitasangs.netlify.app",
  "https://vitasang.netlify.app",
];
const corsOrigins = corsOriginEnv === "*"
  ? true
  : corsOriginEnv
    ? corsOriginEnv.split(",").map(o => o.trim())
    : DEFAULT_ORIGINS;

app.use(cors({
  origin: corsOrigins,
  credentials: corsOrigins !== true,
}));

// Sentry request handler (doit être le premier)
if (sentryEnabled) {
  app.use(Sentry.Handlers.requestHandler());
}

// Trust proxy est essentiel sur Render pour que le rate limiter voit la vraie IP du client
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(compression({
  level: 6,
  threshold: 1024,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
// Uploads handled exclusively via Cloudinary - no local static serving

// Swagger API Documentation (désactivé en production)
if (process.env.NODE_ENV !== "production") {
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
}

const userRoute = require("./routes/users.routes");
const alertRoute = require("./routes/alerts.routes");
const messagesRoute = require("./routes/messages.routes");
const waitlistRoute = require("./routes/waitlist.routes");

const rendezvousRoute = require("./routes/rendezvous.routes");
const centresRoute = require("./routes/centres.routes");
const campaignsRoute = require("./routes/campaigns.routes");

// Limiters spécifiques AVANT le global
app.use("/api/users/register", registerLimiter);
app.use("/api/users/login", authLimiter);
// Pas de rate limit sur les alertes (urgence)

// Global rate limiter
app.use(globalLimiter);

// ENABLED ROUTES: Users (Profile), Alerts, Messages, Waitlist
app.use("/api/users", userRoute);
app.use("/api/alerts", alertRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/waitlist", waitlistRoute);

app.use("/api/rendez-vous", rendezvousRoute);
app.use("/api/centres", centresRoute);
app.use("/api/campaigns", campaignsRoute);

// Route racine & Health Check
app.get("/", (req, res) => {
  res.json({ message: "bienvenu sur vitasang.api.com", version: "1.0.0" });
});

app.get("/api/health", async (req, res) => {
  const cacheService = require('./services/cache.service');
  const checks = {
    db: "disconnected",
    redis: cacheService.redis ? "connected" : "unavailable",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  try {
    await db.sequelize.authenticate();
    checks.db = "connected";
    res.json({ status: "OK", ...checks });
  } catch (error) {
    res.status(503).json({ status: "ERROR", ...checks });
  }
});

app.get("/api/ping", (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ pong: true, ts: Date.now() });
});

// Endpoint pour créer une alerte test (admin only)
app.post("/api/test/alert", verifyToken, isAdmin, async (req, res) => {
  const alertService = require("./services/alert.service");

  try {
    const alertData = {
      latitude: 4.0511,
      longitude: 9.7679,
      groupe_sanguin: "O+",
      radius: 15,
      urgence: "URGENT",
      quantite_requise: 1,
      lieu: "Hôpital Général de Douala",
      description: "Urgence - patient nécessitant une transfusion",
      nom_patient: "Jean",
      telephone_contact: "237612345678"
    };

    const { alerte } = await alertService.createAlert(alertData, 1);
    res.json({ success: true, alertId: alerte.id_alerte, alert: alerte });
  } catch (error) {
    logger.error("Test alert creation failed", { error: error.message });
    res.status(500).json({ message: "Erreur création alerte", error: error.message });
  }
});

// Test push notification endpoint (admin only)
app.post("/api/test/push", verifyToken, isAdmin, async (req, res) => {
  const { token, title, body, alertId, distance, groupe } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token requis" });
  }

  const bloodGroup = groupe || "A+";
  const location = "Hôpital Général de Douala";

  try {
    const { sendPushNotifications, buildPushMessage } = require("./utils/expoNotifications");
    const message = buildPushMessage({
      to: token,
      title: "🩸 URGENCE - Don de sang O+",
      body: "Un patient a besoin de sang O+ URGENT à Douala. Cliquez pour aider!",
      data: {
        type: "alert",
        alertId: alertId || 1,
        distance: distance || 3,
        groupe: bloodGroup,
        lieu: location
      }
    });
    const result = await sendPushNotifications([message]);
    res.json({ success: true, result });
  } catch (error) {
    logger.error("Test push failed", { error: error.message });
    res.status(500).json({ message: "Notification failed", error: error.message });
  }
});

// Sentry error handler (doit être avant l'error handler global)
if (sentryEnabled) {
  app.use(Sentry.Handlers.errorHandler());
}

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Démarrage serveur (si lancé directement)
let server;
if (require.main === module) {
  const PORT = process.env.PORT || 10000;
  server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Serveur VITASANG démarré sur : http://0.0.0.0:${PORT}`);

    db.sequelize
      .authenticate()
      .then(() => {
        logger.info("MariaDB : Connexion réussie !");
      })
      .catch((err) => {
        logger.error("Erreur de connexion MariaDB :", err);
      });
  });
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  if (server) {
    server.close(() => {
      db.sequelize.close().then(() => {
        logger.info("Database connections closed");
        process.exit(0);
      });
    });
  }
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export pour Render
module.exports = app;
