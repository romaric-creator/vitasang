const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"] || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).json({
            message: "Un token est requis pour l'authentification",
        });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        logger.error("JWT Verification Error", { error: err.message, token: token.substring(0, 20) + "..." });
        return res.status(401).json({
            message: "Token invalide ou expiré",
        });
    }
    return next();
};

module.exports = { verifyToken };
