const db = require("../models");
const RendezVous = db.RendezVous;
const Utilisateur = db.Utilisateur;
const Centre = db.Centre;
const TypeDon = db.TypeDon;
const logger = require("../config/logger");

// Créer un rendez-vous
exports.createRendezVous = async (req, res, next) => {
  try {
    const { id_centre, date_rdv, heure_debut, id_type_don } = req.body;
    const id_donneur = req.user.id;

    logger.info('Creating rendez-vous', { userId: id_donneur, centreId: id_centre, date: date_rdv });

    const dateTime = new Date(`${date_rdv}T${heure_debut}:00+01:00`);

    // Anti-double-booking check
    const centre = await Centre.findByPk(id_centre);
    if (!centre) {
      return res.status(404).json({ error: "Centre non trouvé" });
    }

    const maxPerSlot = centre.capacite_stockage_max
      ? Math.max(1, Math.floor(centre.capacite_stockage_max / 10))
      : 3;

    const existingCount = await RendezVous.count({
      where: {
        id_centre,
        date_heure_rdv: dateTime,
        statut_rdv: { [db.Sequelize.Op.ne]: "annule" },
      },
    });

    if (existingCount >= maxPerSlot) {
      return res.status(409).json({
        message:
          "Désolé, ce créneau est désormais complet. Veuillez en choisir un autre.",
      });
    }

    const rdv = await RendezVous.create({
      id_donneur,
      id_centre,
      id_type_don: id_type_don || 1,
      date_heure_rdv: dateTime,
      statut_rdv: "planifie",
      code_unique: Math.random().toString(36).substring(2, 12).toUpperCase(),
    });

    logger.info('Rendez-vous created', { rdvId: rdv.id_rdv });

    res.status(201).json({
      message: 'Rendez-vous créé avec succès',
      rdv: {
        id_rdv: rdv.id_rdv,
        date_heure_rdv: rdv.date_heure_rdv,
        statut_rdv: rdv.statut_rdv,
        code_unique: rdv.code_unique
      }
    });
  } catch (error) {
    logger.error('Error creating rendez-vous', { error: error.message, userId: req.user.id });
    next(error);
  }
};

// Récupérer les rendez-vous de l'utilisateur
exports.getUserRendezVous = async (req, res, next) => {
  try {
    const id_donneur = req.user.id;

    logger.info('Fetching user rendez-vous', { userId: id_donneur });

    const rdvs = await RendezVous.findAll({
      where: { id_donneur },
      include: [
        {
          model: Centre,
          as: 'centre',
          attributes: [
            ['id_centre', 'id'],
            ['nom_centre', 'nom'],
            'adresse',
            ['contact_urgence', 'telephone'],
            'ville'
          ]
        },
        { model: TypeDon, as: 'typeDon', attributes: ['id_type_don', ['libelle', 'libelle_type_don']] }
      ],
      order: [['date_heure_rdv', 'DESC']]
    });

    res.status(200).json({
      success: true,
      appointments: rdvs,
      total: rdvs.length
    });
  } catch (error) {
    logger.error('Error fetching rendez-vous', { error: error.message, userId: req.user.id });
    next(error);
  }
};

// Annuler un rendez-vous
exports.cancelRendezVous = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rdv = await RendezVous.findByPk(id);
    if (!rdv) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    if (rdv.id_donneur !== userId) {
      logger.warn('Unauthorized cancel attempt', { userId, rdvId: id, ownerId: rdv.id_donneur });
      return res.status(403).json({ error: "Vous ne pouvez annuler que vos propres rendez-vous" });
    }

    rdv.statut_rdv = 'annule';
    await rdv.save();

    logger.info('Rendez-vous cancelled', { rdvId: id, userId });

    res.status(200).json({ message: "Rendez-vous annulé avec succès" });
  } catch (error) {
    logger.error('Error cancelling rendez-vous', { error: error.message, rdvId: req.params.id });
    next(error);
  }
};

// Récupérer les détails d'un rendez-vous
exports.getRendezVousDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rdv = await RendezVous.findByPk(id, {
      include: [
        { model: Utilisateur, as: 'donneur', attributes: ['prenom', 'nom', 'telephone'] },
        { model: Centre, as: 'centre' },
        { model: TypeDon, as: 'typeDon' }
      ]
    });

    if (!rdv) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    res.status(200).json({ rdv });
  } catch (error) {
    logger.error('Error fetching rendez-vous', { error: error.message, rdvId: req.params.id });
    next(error);
  }
};