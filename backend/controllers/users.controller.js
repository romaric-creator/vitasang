const db = require("../models");
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const Centre = db.Centre;
const logger = require("../config/logger");
const userService = require("../services/user.service");

exports.addUser = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (role === "donneur") {
      const { user, token } = await userService.createDonneur(req.body);
      return res.status(201).json({
        message: "Donneur créé avec succès",
        token,
        user,
      });
    }

    if (role === "personnel") {
      try {
        const user = await userService.createPersonnel(req.body);
        return res.status(201).json({ message: "Personnel de centre créé avec succès", user });
      } catch (error) {
        if (error.message === "CENTRE_NOT_FOUND") {
          return res.status(404).json({ message: "Le centre spécifié n'existe pas." });
        }
        throw error;
      }
    }

    if (role === "centre") {
      const resultat = await userService.createCentreWithAdmin(req.body);
      return res.status(201).json({
        message: "Centre et administrateur créés avec succès",
        ...resultat,
      });
    }

    return res.status(400).json({
      message: "Rôle non reconnu (doit être 'donneur', 'personnel' ou 'centre')",
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Un utilisateur avec cet email ou numéro de téléphone existe déjà.",
      });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { telephone, mot_de_passe } = req.body;

    if (!telephone || !mot_de_passe) {
      return res.status(400).json({
        message: "Le numéro de téléphone et le mot de passe sont requis.",
      });
    }

    try {
      const { user, token } = await userService.authenticate(telephone, mot_de_passe);
      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        token,
        user,
      });
    } catch (error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          message: "Identifiants incorrects ou compte désactivé.",
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await Utilisateur.findAndCountAll({
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
      attributes: { exclude: ["mot_de_passe", "id_centre"] },
      limit,
      offset
    });
    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id, {
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
      attributes: { exclude: ["mot_de_passe", "id_centre"] },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUsersByBloodGroup = async (req, res, next) => {
  try {
    const groupeSanguin = decodeURIComponent(req.params.groupe);
    const users = await Utilisateur.findAll({
      include: [
        {
          model: ProfilDonneur,
          as: "profilDonneur",
          where: { groupe_sanguin: groupeSanguin },
          required: true,
        },
      ],
      attributes: { exclude: ["mot_de_passe", "id_centre"] },
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { latitude, longitude, groupe_sanguin, radius } = req.query;

    if (!latitude || !longitude || !groupe_sanguin || !radius) {
      return res.status(400).json({
        message: "Les paramètres latitude, longitude, groupe_sanguin et radius sont requis.",
      });
    }

    const donors = await userService.searchDonors(req.query);

    res.status(200).json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (error) {
    logger.error("Erreur dans searchUsers:", error);
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id, {
      attributes: { exclude: ["mot_de_passe"] },
      include: [{ model: ProfilDonneur, as: "profilDonneur" }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.json({
      success: true,
      user: {
        id_utilisateur: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        email: user.email,
        ville: user.region,
        role: user.role,
        photo_profil: user.photo_profil,
        groupe_sanguin: user.profilDonneur?.groupe_sanguin || null,
        disponible: user.profilDonneur?.disponible ?? true,
        lat: user.profilDonneur?.lat_actuelle,
        long: user.profilDonneur?.long_actuelle,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePushToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pushToken } = req.body;

    if (id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Non autorisé : vous ne pouvez mettre à jour que votre propre token push.",
      });
    }

    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.push_token = pushToken;
    await user.save();

    res.status(200).json({ message: "Token push mis à jour avec succès." });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez mettre à jour que votre profil." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (req.body.nom) user.nom = req.body.nom;
    if (req.body.prenom) user.prenom = req.body.prenom;
    if (req.body.telephone) user.telephone = req.body.telephone.replace(/\s/g, '');
    if (req.body.ville !== undefined) user.region = req.body.ville;

    await db.sequelize.transaction(async (t) => {
      if (user.role === "donneur" || req.body.groupe_sanguin || req.body.latitude !== undefined || req.body.longitude !== undefined) {
        const profil = await ProfilDonneur.findByPk(user.id_utilisateur, { transaction: t });
        if (profil) {
          if (req.body.groupe_sanguin) {
            const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
            profil.groupe_sanguin = validGroups.includes(req.body.groupe_sanguin) ? req.body.groupe_sanguin : null;
          }
          if (req.body.latitude !== undefined) profil.lat_actuelle = req.body.latitude;
          if (req.body.longitude !== undefined) profil.long_actuelle = req.body.longitude;
          await profil.save({ transaction: t });
        }
      }
      await user.save({ transaction: t });
    });

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: {
        id_utilisateur: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        ville: user.region,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez supprimer que votre compte." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    user.est_actif = false;
    await user.save();

    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};

exports.getUserHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (Number(id) !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez voir que votre historique." });
    }

    const { count, rows: history } = await db.HistoriqueDon.findAndCountAll({
      where: { id_donneur: id },
      include: [
        { model: db.TypeDon, as: "typeDon" },
        { model: db.Centre, as: "centre" },
      ],
      order: [["date_don", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      history,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez mettre à jour que votre propre photo." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier n'a été téléchargé." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const imageUrl = req.file.path;
    user.photo_profil = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Photo de profil mise à jour avec succès",
      photo_profil: imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDonorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    const { disponible, raison_indisponibilite, date_disponibilite, poids, taille } = req.body;
    const [profil] = await ProfilDonneur.findOrCreate({
      where: { id_donneur: parseInt(id) },
      defaults: { groupe_sanguin: null }
    });

    if (disponible !== undefined) profil.disponible = !!disponible;
    if (raison_indisponibilite !== undefined) profil.raison_indisponibilite = raison_indisponibilite;
    if (date_disponibilite !== undefined) profil.date_disponibilite = date_disponibilite;
    if (poids !== undefined) profil.poids = poids;
    if (taille !== undefined) profil.taille = taille;

    await profil.save();
    res.status(200).json({ success: true, message: "Profil donneur mis à jour avec succès.", profil });
  } catch (error) {
    next(error);
  }
};
