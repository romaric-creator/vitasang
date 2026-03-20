/**
 * Middleware pour normaliser les numéros de téléphone
 * Retire tous les espaces et caractères spéciaux
 */

const normalizePhoneNumber = (req, res, next) => {
  if (req.body && req.body.telephone) {
    // Retire tous les espaces et l'indicatif +237
    let tel = req.body.telephone.replace(/\s+/g, "");
    tel = tel.replace(/^(\+237|00237)/, "");
    req.body.telephone = tel;
  }
  next();
};

module.exports = normalizePhoneNumber;
