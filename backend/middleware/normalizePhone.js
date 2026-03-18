/**
 * Middleware pour normaliser les numéros de téléphone
 * Retire tous les espaces et caractères spéciaux
 */

const normalizePhoneNumber = (req, res, next) => {
  if (req.body && req.body.telephone) {
    // Retire tous les espaces
    req.body.telephone = req.body.telephone.replace(/\s+/g, "");
  }
  next();
};

module.exports = normalizePhoneNumber;
