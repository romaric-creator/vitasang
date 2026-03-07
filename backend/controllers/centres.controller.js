const db = require("../models");
const Centre = db.Centre;
const logger = require("../config/logger");

// Récupérer tous les centres
exports.getAllCentres = async (req, res) => {
  try {
    const centres = await Centre.findAll({
      attributes: [
        ['id_centre', 'id'],
        ['nom_centre', 'nom'],
        'adresse',
        'ville',
        ['contact_urgence', 'telephone'],
        'capacite_stockage_max',
        'latitude',
        'longitude'
      ]
    });

    logger.info('Fetched all centres', { count: centres.length });

    res.status(200).json({
      centres,
      total: centres.length
    });
  } catch (error) {
    logger.error('Error fetching centres', { error: error.message });
    res.status(500).json({ error: "Erreur lors de la récupération des centres" });
  }
};

// Rechercher des centres près d'une localisation
exports.searchCentresNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude et longitude requises" });
    }

    // Pour une implémentation simple, retourner tous les centres
    // Une vrai implémentation utiliserait la géolocalisation
    const centres = await Centre.findAll({
      attributes: [
        ['id_centre', 'id'],
        ['nom_centre', 'nom'],
        'adresse',
        'ville',
        ['contact_urgence', 'telephone'],
        'latitude',
        'longitude'
      ]
    });

    logger.info('Searched nearby centres', { latitude, longitude, radius, found: centres.length });

    res.status(200).json({ centres });
  } catch (error) {
    logger.error('Error searching centres', { error: error.message });
    res.status(500).json({ error: "Erreur lors de la recherche des centres" });
  }
};

// Récupérer détails d'un centre
exports.getCentreDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id);

    if (!centre) {
      return res.status(404).json({ error: "Centre non trouvé" });
    }

    res.status(200).json({ centre });
  } catch (error) {
    logger.error('Error fetching centre', { error: error.message, centreId: req.params.id });
    res.status(500).json({ error: "Erreur lors de la récupération du centre" });
  }
};

// Récupérer disponibilités d'un centre
exports.getCentreAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id);
    if (!centre) {
      return res.status(404).json({ error: "Centre non trouvé" });
    }

    // Générer les créneaux disponibles (simplified)
    const slots = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      slots.push({
        date: date.toISOString().split('T')[0],
        times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      });
    }

    res.status(200).json({ centreId: id, slots });
  } catch (error) {
    logger.error('Error fetching availability', { error: error.message, centreId: req.params.id });
    res.status(500).json({ error: "Erreur lors de la récupération des disponibilités" });
  }
};
