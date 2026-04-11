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

// Initialisation Sentry - vérifier si le package est bien chargé
let sentryEnabled = false;
try {
  sentryEnabled = !!(process.env.SENTRY_DSN && Sentry.Handlers);
  if (sentryEnabled) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 1.0,
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

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["http://localhost:3000", "http://localhost:8081"];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
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
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

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
const rendezvousRoute = require("./routes/rendezvous.routes");
const centresRoute = require("./routes/centres.routes");
const campaignsRoute = require("./routes/campaigns.routes");
const messagesRoute = require("./routes/messages.routes");

// Limiters spécifiques AVANT le global
app.use("/api/users/register", registerLimiter);
app.use("/api/users/login", authLimiter);
// Pas de rate limit sur les alertes (国有 urgence)

// Global rate limiter
app.use(globalLimiter);

app.use("/api/users", userRoute);
app.use("/api/alerts", alertRoute);
app.use("/api/rendez-vous", rendezvousRoute);
app.use("/api/centres", centresRoute);
app.use("/api/campaigns", campaignsRoute);
app.use("/api/messages", messagesRoute);

// Route racine & Health Check
app.get("/", (req, res) => {
  res.json({ message: "bienvenu sur vitasang.api.com", version: "1.0.0" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// Test push notification endpoint
app.post("/api/test/push", async (req, res) => {
  const { token, title, body } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token requis" });
  }
  
  try {
    const { sendPushNotifications, buildPushMessage } = require("./utils/expoNotifications");
    const message = buildPushMessage({
      to: token,
      title: title || "Test VitaSang",
      body: body || "Ceci est un test de notification",
      data: { type: "test" }
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
if (require.main === module) {
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Serveur VITASANG démarré sur : http://0.0.0.0:${PORT}`);

    // Tentative de connexion MariaDB en arrière-plan
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

// Export pour Render
module.exports = app;
