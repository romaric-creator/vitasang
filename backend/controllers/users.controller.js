const db = require("../models"); // Importe l'objet db centralisé
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const Centre = db.Centre;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { calculateDistance } = require('../utils/geoHelpers');

exports.addUser = async (req, res) => {
  try {
    const { role } = req.body;

    // CAS 1 : C'EST UN DONNEUR
    if (role === "donneur") {
      let {
        nom,
        prenom,
        // email,
        mot_de_passe,
        telephone,
        // region,
        groupe_sanguin,
        // poids,
        // taille,
      } = req.body;

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
            // email,
            mot_de_passe: hashedPassword,
            telephone,
            // region,
            role: "donneur",
            profilDonneur: {
              // Sequelize va créer le profil associé grâce à l'association
              groupe_sanguin,
              lat_actuelle: 0, // Valeur par défaut
              long_actuelle: 0, // Valeur par défaut
              // poids,
              // taille,
            },
          },
          {
            include: [{ model: ProfilDonneur, as: "profilDonneur" }],
          },
        );

        return res
          .status(201)
          .json({ message: "Donneur créé avec succès", user });
      } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur (donneur) :", error); // Log interne pour le débogage
        return next(error); // Passe l'erreur au middleware suivant
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
        message: "Un utilisateur avec cet email ou numéro de téléphone existe déjà.",
      });
    }
    next(error); // Passe toutes les autres erreurs au middleware de gestion d'erreurs global
  }
};

exports.login = async (req, res) => {
  try {
    const { telephone, mot_de_passe } = req.body;

    if (!telephone || !mot_de_passe) {
      return res.status(400).json({ message: "Le numéro de téléphone et le mot de passe sont requis." });
    }

    // On cherche l'utilisateur et on inclut ses données associées
    const user = await Utilisateur.findOne({
      where: { telephone },
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
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
      attributes: { exclude: ['mot_de_passe', 'id_centre'] } // Exclure le mot de passe
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id, {
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
      attributes: { exclude: ['mot_de_passe', 'id_centre'] } // Exclure le mot de passe
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

exports.getUsersByBloodGroup = async (req, res) => {
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
      attributes: { exclude: ['mot_de_passe', 'id_centre'] } // Exclure le mot de passe
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Table de compatibilité sanguine (Qui peut donner à qui)
const bloodCompatibility = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

/**
 * Recherche les donneurs par groupe sanguin et par proximité géographique.
 * Gère la compatibilité des groupes sanguins.
 */
exports.searchUsers = async (req, res) => {
  try {
    // 1. Récupération et validation des paramètres
    const { lat, long, blood, rayon } = req.query;

    if (!lat || !long || !blood || !rayon) {
      return res.status(400).json({
        message: "Les paramètres lat, long, blood et rayon sont requis."
      });
    }

    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);
    const searchRayon = parseFloat(rayon);
    // On décode l'URL et on remplace l'espace (qui vient du '+') par un vrai '+'
    const targetBlood = decodeURIComponent(blood).replace(' ', '+');

    // Trouver quels groupes peuvent donner au groupe cible
    const compatibleGroups = Object.keys(bloodCompatibility).filter(group =>
      bloodCompatibility[group].includes(targetBlood)
    );

    // 2. Recherche SQL : Filtrage par groupes sanguins compatibles
    const potentialDonors = await Utilisateur.findAll({
      where: { role: 'donneur' },
      include: [
        {
          model: ProfilDonneur,
          as: "profilDonneur",
          where: {
            groupe_sanguin: compatibleGroups
          },
          required: true
        }
      ],
      attributes: { exclude: ['mot_de_passe', 'id_centre'] }
    });

    // 3. Filtrage par Proximité et calcul de distance
    const matchedDonors = [];

    potentialDonors.forEach(donor => {
      if (donor.profilDonneur && donor.profilDonneur.lat_actuelle && donor.profilDonneur.long_actuelle) {
        const distance = calculateDistance(
          userLat,
          userLong,
          donor.profilDonneur.lat_actuelle,
          donor.profilDonneur.long_actuelle
        );

        if (distance <= searchRayon) {
          const donorData = donor.toJSON();
          donorData.distance = parseFloat(distance.toFixed(2));
          matchedDonors.push(donorData);
        }
      }
    });

    // 4. Tri par distance (du plus proche au plus loin)
    matchedDonors.sort((a, b) => a.distance - b.distance);

    // 5. Réponse finale au front-end
    res.status(200).json({
      success: true,
      count: matchedDonors.length,
      donors: matchedDonors
    });

  } catch (error) {
    console.error("Erreur détaillée dans searchUsers:", error);
    next(error);
  }
};

exports.getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Utilisateur.findByPk(id, {
      attributes: { exclude: ['mot_de_passe'] },
      include: [
        {
          model: ProfilDonneur,
          as: 'profilDonneur',
        },
        {
          model: db.HistoriqueDon,
          as: 'historiqueDons',
          include: [{ model: db.TypeDon, as: 'typeDon' }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Nombre d'alertes lancées par cet utilisateur
    const alertesCount = await db.Alerte.count({ where: { id_initiateur: id } });

    res.json({
      success: true,
      user: {
        id_utilisateur: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        email: user.email,
        region: user.region,
        role: user.role,
        groupe_sanguin: user.profilDonneur?.groupe_sanguin || null,
        disponible: user.profilDonneur?.disponible ?? true,
        lat: user.profilDonneur?.lat_actuelle,
        long: user.profilDonneur?.long_actuelle,
        donsCount: user.historiqueDons?.length || 0,
        alertesCount,
        historiqueDons: user.historiqueDons || []
      }
    });
  } catch (error) {
    console.error("Erreur getUserProfile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePushToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { pushToken } = req.body; // Assuming the body contains { pushToken: "ExponentPushToken[...]" }

    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required." });
    }

    const user = await Utilisateur.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.token_firebase = pushToken; // Update the existing token_firebase field
    await user.save();

    res.status(200).json({ message: "Push token updated successfully." });
  } catch (error) {
    console.error("Error updating push token:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};