const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"] || req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({
      message: "Un token est requis pour l'authentification",
    });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET,
    );
    req.user = decoded;
  } catch (err) {
    logger.error("JWT Verification Error", {
      error: err.message,
      token: token.substring(0, 20) + "...",
    });
    return res.status(401).json({
      message: "Token invalide ou expiré",
    });
  }
  return next();
};

/**
 * Middleware de vérification de rôle
 * Utilisation : requireRole('admin'), requireRole('centre')
 */
const requireRole = (roles) => {
  // Convertir un rôle unique en tableau si nécessaire
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentification requise",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Access denied: Insufficient role", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
      });
      return res.status(403).json({
        message: "Accès refusé: rôle insuffisant",
      });
    }

    return next();
  };
};

module.exports = { verifyToken, requireRole };
