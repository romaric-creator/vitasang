const db = require("../models");
const Centre = db.Centre;
const StockSang = db.StockSang;
const RendezVous = db.RendezVous;
const logger = require("../config/logger");

// Récupérer tous les centres
exports.getAllCentres = async (req, res, next) => {
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
    next(error);
  }
};

// Rechercher des centres près d'une localisation
exports.searchCentresNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude et longitude requises" });
    }

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
    next(error);
  }
};

// Récupérer détails d'un centre
exports.getCentreDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      attributes: [
        ['id_centre', 'id_centre'],
        ['nom_centre', 'nom_centre'],
        'adresse',
        'ville',
        ['contact_urgence', 'telephone'],
        'capacite_stockage_max',
        'latitude',
        'longitude'
      ]
    });

    if (!centre) {
      return res.status(404).json({ success: false, error: "Centre non trouvé" });
    }

    res.status(200).json({ success: true, centre });
  } catch (error) {
    logger.error('Error fetching centre', { error: error.message, centreId: req.params.id });
    next(error);
  }
};

// Récupérer disponibilités d'un centre
exports.getCentreAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id);
    if (!centre) {
      return res.status(404).json({ error: "Centre non trouvé" });
    }

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
    next(error);
  }
};

// Récupérer les statistiques globales pour le tableau de bord d'un centre
exports.getCentreStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const centerId = parseInt(id);

    const stockStats = await StockSang.findAll({
      where: { id_centre: centerId },
      attributes: ['groupe_sanguin', 'quantite_poches', 'seuil_alerte_min']
    });
    const totalStock = stockStats.reduce((sum, item) => sum + item.quantite_poches, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await RendezVous.count({
      where: {
        id_centre: centerId,
        date_heure_rdv: { [db.Sequelize.Op.gte]: today, [db.Sequelize.Op.lt]: tomorrow },
        statut_rdv: 'planifie'
      }
    });

    const activeAlerts = await db.Alerte.count({
      where: { id_centre: centerId, statut: 'en_cours' }
    });

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const donationsThisMonth = await db.HistoriqueDon.count({
      where: { id_centre: centerId, date_don: { [db.Sequelize.Op.gte]: firstDayOfMonth } }
    });

    res.status(200).json({
      success: true,
      stats: { totalStock, appointmentsToday, activeAlerts, donationsThisMonth, bloodDetail: stockStats }
    });
  } catch (error) {
    logger.error('Error fetching centre stats', { error: error.message, centreId: req.params.id });
    next(error);
  }
};

// Récupérer le stock de sang d'un centre
exports.getCentreBloodStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stock = await StockSang.findAll({
      where: { id_centre: parseInt(id) },
      order: [['groupe_sanguin', 'ASC']]
    });
    res.status(200).json({ success: true, stock });
  } catch (error) {
    logger.error('Error fetching blood stock', { error: error.message, centreId: req.params.id });
    next(error);
  }
};

// Mettre à jour le stock de sang d'un centre
exports.updateBloodStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { groupe_sanguin, quantite_poches, seuil_alerte_min } = req.body;

    if (!groupe_sanguin || quantite_poches === undefined) {
      return res.status(400).json({ message: 'groupe_sanguin et quantite_poches sont requis.' });
    }

    const [stockEntry, created] = await StockSang.findOrCreate({
      where: { id_centre: parseInt(id), groupe_sanguin },
      defaults: { quantite_poches, seuil_alerte_min: seuil_alerte_min || 5 }
    });

    if (!created) {
      stockEntry.quantite_poches = quantite_poches;
      if (seuil_alerte_min !== undefined) stockEntry.seuil_alerte_min = seuil_alerte_min;
      await stockEntry.save();
    }

    res.status(200).json({ success: true, message: 'Stock mis à jour.', stock: stockEntry });
  } catch (error) {
    logger.error('Error updating blood stock', { error: error.message, centreId: req.params.id });
    next(error);
  }
};

// Récupérer les rendez-vous d'un centre
exports.getCentreRendezVous = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rdvs = await RendezVous.findAll({
      where: { id_centre: parseInt(id) },
      include: [
        { model: db.Utilisateur, as: 'donneur', attributes: ['nom', 'prenom', 'telephone'] },
        { model: db.TypeDon, as: 'typeDon', attributes: ['id_type_don', ['libelle', 'libelle_type_don']] }
      ],
      order: [['date_heure_rdv', 'ASC']]
    });
    res.status(200).json({ success: true, appointments: rdvs, total: rdvs.length });
  } catch (error) {
    logger.error('Error fetching centre appointments', { error: error.message, centreId: req.params.id });
    next(error);
  }
};

// Mettre à jour le statut d'un rendez-vous du centre
exports.updateRendezVousStatut = async (req, res, next) => {
  try {
    const { id, rdvId } = req.params;
    const { statut_rdv } = req.body;

    const validStatuts = ['planifie', 'confirme', 'effectue', 'annule'];
    if (!validStatuts.includes(statut_rdv)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs: ${validStatuts.join(', ')}` });
    }

    const rdv = await RendezVous.findOne({ where: { id_rdv: rdvId, id_centre: parseInt(id) } });
    if (!rdv) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });

    rdv.statut_rdv = statut_rdv;
    await rdv.save();

    res.status(200).json({ success: true, message: 'Statut mis à jour.', rdv });
  } catch (error) {
    logger.error('Error updating rdv status', { error: error.message, centreId: req.params.id });
    next(error);
  }
};