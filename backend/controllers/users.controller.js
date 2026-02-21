const db = require("../models"); // Importe l'objet db centralisé
const Utilisateur = db.Utilisateur;
const ProfilDonneur = db.ProfilDonneur;
const Centre = db.Centre;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        console.error("Erreur lors de la création de l'utilisateur :", error);
        return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur", details: error });
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
        message: "L'email ou le téléphone existe déjà.",
        details: error.errors,
      });
    }
    res.status(500).json({ error: error.message, stack: error.stack });
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

    res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
      attributes: { exclude: ['mot_de_passe'] } // Exclure le mot de passe
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id, {
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
      attributes: { exclude: ['mot_de_passe'] } // Exclure le mot de passe
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
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
      attributes: { exclude: ['mot_de_passe'] } // Exclure le mot de passe
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};