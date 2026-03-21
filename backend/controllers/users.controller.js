const db = require("../models"); // Importe l'objet db centralisé
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const Centre = db.Centre;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

exports.addUser = async (req, res, next) => {
  try {
    const { role } = req.body;

    // CAS 1 : C'EST UN DONNEUR
    if (role === "donneur") {
      let { nom, prenom, mot_de_passe, telephone, groupe_sanguin } = req.body;

      // Validation simple
      if (!nom || !mot_de_passe) {
        return res.status(400).json({
          message: "Les champs nom et mot de passe sont requis.",
        });
      }

      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      // Création de l'utilisateur et de son profil en une seule transaction
      try {
        const user = await Utilisateur.create(
          {
            nom,
            prenom,
            mot_de_passe: hashedPassword,
            telephone,
            role: "donneur",
            profilDonneur: {
              groupe_sanguin,
              lat_actuelle: null,
              long_actuelle: null,
            },
          },
          {
            include: [{ model: ProfilDonneur, as: "profilDonneur" }],
          },
        );

        // Génération du token pour permettre l'auto-connexion après inscription
        const token = jwt.sign(
          { id: user.id_utilisateur, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "24h" },
        );

        return res.status(201).json({
          message: "Donneur créé avec succès",
          token, // Ajout du token ici
          user,
        });
      } catch (error) {
        logger.error(
          "Erreur lors de la création de l'utilisateur (donneur) :",
          { error: error.message, stack: error.stack },
        );
        return res
          .status(500)
          .json({ message: "Erreur lors de la création du compte." });
      }
    }

    // CAS 2 : C'EST UN PERSONNEL DE CENTRE
    if (role === "personnel") {
      let { nom, email, mot_de_passe, id_centre } = req.body;

      if (!nom || !email || !mot_de_passe || !id_centre) {
        return res.status(400).json({
          message:
            "Les champs nom, email, mot de passe et id_centre sont requis.",
        });
      }

      const centre = await Centre.findByPk(id_centre);
      if (!centre) {
        return res
          .status(404)
          .json({ message: "Le centre spécifié n'existe pas." });
      }

      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      const user = await Utilisateur.create({
        nom,
        email,
        mot_de_passe: hashedPassword,
        role: "personnel",
        id_centre: centre.id_centre, // Lien vers le centre
      });

      return res
        .status(201)
        .json({ message: "Personnel de centre créé avec succès", user });
    }

    // CAS 3 : C'EST UN NOUVEAU CENTRE (crée le centre et un utilisateur admin pour ce centre)
    if (role === "centre") {
      const {
        nom_centre,
        adresse,
        ville,
        latitude,
        longitude,
        contact_urgence,
        capacite_stockage_max,
        admin_nom,
        admin_email,
        admin_pass,
      } = req.body;

      if (!nom_centre || !admin_nom || !admin_email || !admin_pass) {
        return res.status(400).json({
          message:
            "Les informations du centre et de l'administrateur sont requises.",
        });
      }

      const hashedPassword = await bcrypt.hash(admin_pass, 10);

      // Crée le centre et l'utilisateur admin dans une transaction pour assurer la cohérence
      const resultat = await db.sequelize.transaction(async (t) => {
        const nouveauCentre = await Centre.create(
          {
            nom_centre,
            adresse,
            ville,
            latitude,
            longitude,
            contact_urgence,
            capacite_stockage_max,
          },
          { transaction: t },
        );

        const adminUser = await Utilisateur.create(
          {
            nom: admin_nom,
            email: admin_email,
            mot_de_passe: hashedPassword,
            role: "admin",
            id_centre: nouveauCentre.id_centre,
          },
          { transaction: t },
        );

        return { centre: nouveauCentre, admin: adminUser };
      });

      return res.status(201).json({
        message: "Centre et administrateur créés avec succès",
        ...resultat,
      });
    }

    return res.status(400).json({
      message:
        "Rôle non reconnu (doit être 'donneur', 'personnel' ou 'centre')",
    });
  } catch (error) {
    // Gestion des erreurs de validation Sequelize (ex: email unique)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "Un utilisateur avec cet email ou numéro de téléphone existe déjà.",
      });
    }
    next(error); // Passe toutes les autres erreurs au middleware de gestion d'erreurs global
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

    // On cherche l'utilisateur et on inclut ses données associées
    const user = await Utilisateur.findOne({
      where: { telephone, est_actif: true },
      include: [
        {
          model: ProfilDonneur,
          as: "profilDonneur", // Alias défini dans le modèle Utilisateur
        },
        {
          model: Centre,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message:
          "Identifiants incorrects ou compte désactivé. Veuillez vérifier votre numéro.",
      });
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Préparation du token JWT
    const token = jwt.sign(
      { id: user.id_utilisateur, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // On construit la réponse en ne gardant que l'essentiel
    const userResponse = {
      id: user.id_utilisateur,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
    };

    // Ajout des détails spécifiques au rôle
    if (user.role === "donneur" && user.profilDonneur) {
      userResponse.profilDonneur = user.profilDonneur;
    } else if (
      (user.role === "personnel" || user.role === "admin") &&
      user.Centre
    ) {
      userResponse.centre = user.Centre;
    }

    // RENVOI DE LA RÉPONSE
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: userResponse,
    });
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
      attributes: { exclude: ["mot_de_passe", "id_centre"] }, // Exclure le mot de passe
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
      attributes: { exclude: ["mot_de_passe", "id_centre"] }, // Exclure le mot de passe
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
    // Décoder le paramètre d'URL pour gérer les caractères comme '+' (qui devient un espace)
    const groupeSanguin = decodeURIComponent(req.params.groupe);

    const users = await Utilisateur.findAll({
      include: [
        {
          model: ProfilDonneur,
          as: "profilDonneur",
          where: { groupe_sanguin: groupeSanguin },
          required: true, // INNER JOIN pour ne retourner que les donneurs
        },
      ],
      attributes: { exclude: ["mot_de_passe", "id_centre"] }, // Exclure le mot de passe
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Table de compatibilité sanguine (Qui peut donner à qui)
const { BLOOD_COMPATIBILITY } = require("../utils/bloodCompatibility");

/**
 * Recherche les donneurs par groupe sanguin et par proximité géographique.
 * Gère la compatibilité des groupes sanguins.
 */
exports.searchUsers = async (req, res, next) => {
  try {
    // 1. Récupération et validation des paramètres
    const { latitude, longitude, groupe_sanguin, radius } = req.query;

    if (!latitude || !longitude || !groupe_sanguin || !radius) {
      return res.status(400).json({
        message:
          "Les paramètres latitude, longitude, groupe_sanguin et radius sont requis.",
      });
    }

    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);
    const searchRayon = parseFloat(radius);
    // On décode l'URL et on remplace l'espace (qui vient du '+') par un vrai '+'
    const targetBlood = decodeURIComponent(groupe_sanguin).replace(" ", "+");

    // Trouver quels groupes peuvent donner au groupe cible
    const compatibleGroups = Object.keys(BLOOD_COMPATIBILITY).filter((group) =>
      BLOOD_COMPATIBILITY[group].includes(targetBlood),
    );

    const haversine = `(
      6371 * acos(
        cos(radians(${userLat})) * cos(radians(\`profilDonneur\`.\`lat_actuelle\`)) *
        cos(radians(\`profilDonneur\`.\`long_actuelle\`) - radians(${userLong})) +
        sin(radians(${userLat})) * sin(radians(\`profilDonneur\`.\`lat_actuelle\`))
      )
    )`;

    // 2. Recherche SQL : Filtrage direct en base
    const potentialDonors = await Utilisateur.findAll({
      where: { role: "donneur" },
      include: [
        {
          model: ProfilDonneur,
          as: "profilDonneur",
          where: {
            groupe_sanguin: compatibleGroups,
            [db.Sequelize.Op.and]: db.sequelize.where(db.sequelize.literal(haversine), '<=', searchRayon)
          },
          required: true,
        },
      ],
      attributes: {
        exclude: ["mot_de_passe", "id_centre"],
        include: [
          [db.sequelize.literal(haversine), 'distance']
        ]
      },
      order: db.sequelize.literal('distance ASC')
    });

    // 5. Réponse finale au front-end
    res.status(200).json({
      success: true,
      count: potentialDonors.length,
      donors: potentialDonors,
    });
  } catch (error) {
    logger.error("Erreur détaillée dans searchUsers:", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await Utilisateur.findByPk(id, {
      attributes: { exclude: ["mot_de_passe"] },
      include: [
        {
          model: ProfilDonneur,
          as: "profilDonneur",
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Nombre de dons et d'alertes
    const donsCount = await db.HistoriqueDon.count({
      where: { id_donneur: id },
    });

    const alertesCount = await db.Alerte.count({
      where: { id_initiateur: id },
    });

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
        donsCount,
        alertesCount,
      },
    });
  } catch (error) {
    logger.error("Erreur getUserProfile:", {
      error: error.message,
      userId: req.params.id,
    });
    next(error);
  }
};

exports.updatePushToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pushToken } = req.body; // Assuming the body contains { pushToken: "ExponentPushToken[...]" }

    // Authorization check: Ensure the user is updating their own token
    if (id.toString() !== req.user.id.toString()) {
      logger.warn("Unauthorized push token update attempt", {
        userId: req.user.id,
        targetId: id,
      });
      return res.status(403).json({
        message:
          "Non autorisé : vous ne pouvez mettre à jour que votre propre token push.",
      });
    }

    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required." });
    }

    const user = await Utilisateur.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.push_token = pushToken; // Update the push_token field
    await user.save();

    res.status(200).json({ message: "Token push mis à jour avec succès." });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du token push:", error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization check: Ensure user is updating their own profile
    if (Number(id) !== req.user.id) {
      logger.warn("Unauthorized update attempt", {
        userId: req.user.id,
        targetId: id,
      });
      return res
        .status(403)
        .json({ error: "Vous ne pouvez mettre à jour que votre profil." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Update user fields
    if (req.body.nom) user.nom = req.body.nom;
    if (req.body.prenom) user.prenom = req.body.prenom;
    if (req.body.telephone) user.telephone = req.body.telephone;
    if (req.body.ville !== undefined) user.region = req.body.ville; // Map ville to region

    // Update profil donneur if it exists or if blood/location fields are provided
    await db.sequelize.transaction(async (t) => {
      if (
        user.profilDonneur ||
        req.body.groupe_sanguin ||
        req.body.latitude !== undefined ||
        req.body.longitude !== undefined
      ) {
        const profil = await ProfilDonneur.findByPk(user.id_utilisateur, { transaction: t });
        if (profil) {
          if (req.body.groupe_sanguin)
            profil.groupe_sanguin = req.body.groupe_sanguin;
          if (req.body.latitude !== undefined)
            profil.lat_actuelle = req.body.latitude;
          if (req.body.longitude !== undefined)
            profil.long_actuelle = req.body.longitude;
          await profil.save({ transaction: t });
        }
      }

      await user.save({ transaction: t });
    });
    logger.info("User profile updated", { userId: id });

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: {
        id_utilisateur: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        ville: user.region, // Assurez-vous que c'est le bon champ
      },
    });
  } catch (error) {
    logger.error("Error updating user", {
      error: error.message,
      userId: req.params.id,
    });
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (Number(id) !== req.user.id) {
      logger.warn("Unauthorized delete attempt", {
        userId: req.user.id,
        targetId: id,
      });
      return res
        .status(403)
        .json({ error: "Vous ne pouvez supprimer que votre compte." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Soft delete - set est_actif to false instead of hard deleting
    user.est_actif = false;
    await user.save();

    logger.info("User account deactivated", { userId: id });

    res.status(200).json({
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    logger.error("Error deleting user", {
      error: error.message,
      userId: req.params.id,
    });
    next(error);
  }
};

exports.getUserHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Authorization check
    if (Number(id) !== req.user.id) {
      logger.warn("Unauthorized history access", {
        userId: req.user.id,
        targetId: id,
      });
      return res
        .status(403)
        .json({ error: "Vous ne pouvez voir que votre historique." });
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

    logger.info("User history retrieved", {
      userId: id,
      page,
      limit,
      total: count,
      returned: history.length,
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
    logger.error("Error fetching user history", {
      error: error.message,
      userId: req.params.id,
    });
    next(error);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (Number(id) !== req.user.id) {
      return res.status(403).json({
        error: "Vous ne pouvez mettre à jour que votre propre photo.",
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Aucun fichier n'a été téléchargé." });
    }

    const user = await Utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Avec CloudinaryStorage, req.file.path contient l'URL publique de l'image
    const imageUrl = req.file.path;
    user.photo_profil = imageUrl;
    await user.save();

    logger.info("Profile picture updated on Cloudinary", {
      userId: id,
      url: imageUrl,
    });

    res.status(200).json({
      success: true,
      message: "Photo de profil mise à jour avec succès",
      photo_profil: imageUrl,
    });
  } catch (error) {
    logger.error("Error uploading profile picture", {
      error: error.message,
      userId: req.params.id,
    });
    next(error);
  }
};
// Update donor profile (availability, weight, etc.)
exports.updateDonorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;

    if (parseInt(id) !== requestingUserId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    const { disponible, raison_indisponibilite, date_disponibilite, poids, taille } = req.body;

    const [profil, created] = await ProfilDonneur.findOrCreate({
      where: { id_donneur: parseInt(id) },
      defaults: { groupe_sanguin: null }
    });

    if (disponible !== undefined) profil.disponible = !!disponible;
    if (raison_indisponibilite !== undefined) profil.raison_indisponibilite = raison_indisponibilite;
    if (date_disponibilite !== undefined) profil.date_disponibilite = date_disponibilite;
    if (poids !== undefined) profil.poids = poids;
    if (taille !== undefined) profil.taille = taille;

    await profil.save();

    logger.info("Donor profile updated", { userId: id, disponible: profil.disponible });

    res.status(200).json({
      success: true,
      message: "Profil donneur mis à jour avec succès.",
      profil
    });
  } catch (error) {
    logger.error("Error updating donor profile", { error: error.message, userId: req.params.id });
    next(error);
  }
};
