const express = require("express");
const router = express.Router();
const Joi = require("joi");
const db = require("../models/index");
const logger = require("../config/logger");

const waitlistSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(255).optional().allow("", null),
  whatsapp: Joi.string().pattern(/^[0-9+\s\-().]{6,20}$/).max(30).optional().allow("", null),
  source: Joi.string().max(50).optional(),
}).or("email", "whatsapp");

// POST /api/waitlist - Public, no JWT required
router.post("/", async (req, res) => {
  const { error, value } = waitlistSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const email = value.email ? value.email.toLowerCase() : null;
  const whatsapp = value.whatsapp ? value.whatsapp.replace(/[^0-9+]/g, "") : null;

  try {
    // Vérifie doublon par email OU whatsapp
    const existing = await db.Waitlist.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          ...(email ? [{ email }] : []),
          ...(whatsapp ? [{ whatsapp }] : []),
        ],
      },
    });

    if (existing) {
      return res.status(200).json({ success: true, alreadyExists: true });
    }

    await db.Waitlist.create({
      email,
      whatsapp,
      source: value.source || "landing_page",
    });

    logger.info("Waitlist: new entry registered", { email, whatsapp, source: value.source });
    return res.status(201).json({ success: true, message: "Inscrit !" });
  } catch (err) {
    logger.error("Waitlist: error saving entry", { error: err.message });
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/waitlist?key=ADMIN_KEY
router.get("/", async (req, res) => {
  const adminKey = process.env.ADMIN_KEY || "vitasang-admin-2026";
  if (req.query.key !== adminKey) {
    return res.status(401).json({ success: false, message: "Clé invalide" });
  }
  try {
    const list = await db.Waitlist.findAll({
      attributes: ["id", "email", "whatsapp", "source", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    logger.error("Waitlist: error fetching list", { error: err.message });
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
