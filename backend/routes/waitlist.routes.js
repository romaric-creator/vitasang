const express = require("express");
const router = express.Router();
const Joi = require("joi");
const db = require("../models/index");
const logger = require("../config/logger");

const emailSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(255).required(),
  source: Joi.string().max(50).optional(),
});

// POST /api/waitlist - Public, no JWT required
router.post("/", async (req, res) => {
  const { error, value } = emailSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  try {
    const [, created] = await db.Waitlist.findOrCreate({
      where: { email: value.email.toLowerCase() },
      defaults: {
        email: value.email.toLowerCase(),
        source: value.source || "landing_page",
      },
    });

    if (!created) {
      return res.status(200).json({ success: true, alreadyExists: true });
    }

    logger.info("Waitlist: new email registered", { email: value.email, source: value.source });
    return res.status(201).json({ success: true, message: "Inscrit !" });
  } catch (err) {
    logger.error("Waitlist: error saving email", { error: err.message });
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
