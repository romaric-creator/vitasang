const db = require("../models");
const { Utilisateur, ProfilDonneur, Centre } = db;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { BLOOD_COMPATIBILITY } = require("../utils/bloodCompatibility");

/**
 * Service pour la gestion des utilisateurs
 */
class UserService {
  /**
   * Crée un donneur
   */
  async createDonneur(data) {
    let { nom, prenom, mot_de_passe, telephone, groupe_sanguin } = data;

    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validBloodGroups.includes(groupe_sanguin)) {
      groupe_sanguin = null;
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const user = await Utilisateur.create(
      {
        nom,
        prenom,
        mot_de_passe: hashedPassword,
        telephone,
        email: null,
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

    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Crée un personnel de centre
   */
  async createPersonnel(data) {
    const { nom, email, mot_de_passe, id_centre } = data;

    const centre = await Centre.findByPk(id_centre);
    if (!centre) {
      throw new Error("CENTRE_NOT_FOUND");
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const user = await Utilisateur.create({
      nom,
      email,
      mot_de_passe: hashedPassword,
      role: "personnel",
      id_centre: centre.id_centre,
    });

    return user;
  }

  /**
   * Crée un centre et son administrateur
   */
  async createCentreWithAdmin(data) {
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
    } = data;

    const hashedPassword = await bcrypt.hash(admin_pass, 10);

    return await db.sequelize.transaction(async (t) => {
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
  }

  /**
   * Authentifie un utilisateur
   */
  async authenticate(telephone, mot_de_passe) {
    const cleanPhone = telephone.replace(/\s/g, '');

    const user = await Utilisateur.findOne({
      where: { telephone: cleanPhone, est_actif: true },
      include: [
        { model: ProfilDonneur, as: "profilDonneur" },
        { model: Centre },
      ],
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = this.generateToken(user);

    const userResponse = {
      id: user.id_utilisateur,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
    };

    if (user.role === "donneur" && user.profilDonneur) {
      userResponse.profilDonneur = user.profilDonneur;
    } else if ((user.role === "personnel" || user.role === "admin") && user.Centre) {
      userResponse.centre = {
        id: user.Centre.id_centre,
        nom: user.Centre.nom_centre,
        adresse: user.Centre.adresse,
        ville: user.Centre.ville,
        telephone: user.Centre.contact_urgence,
        latitude: user.Centre.latitude,
        longitude: user.Centre.longitude
      };
    }

    return { user: userResponse, token };
  }

  /**
   * Recherche des donneurs compatibles à proximité
   */
  async searchDonors(params) {
    const { latitude, longitude, groupe_sanguin, radius } = params;
    
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);
    const searchRayon = parseFloat(radius);
    const targetBlood = decodeURIComponent(groupe_sanguin).replace(" ", "+");

    // Validation des coordonnées
    if (isNaN(userLat) || isNaN(userLong) || isNaN(searchRayon)) {
      logger.warn("searchDonors: coordonnées invalides", { latitude, longitude, radius });
      return [];
    }

    // Limiter le rayon de recherche pour éviter les timeouts
    const safeRadius = Math.min(searchRayon, 200); // Max 200km
    
    const compatibleGroups = Object.keys(BLOOD_COMPATIBILITY).filter((group) =>
      BLOOD_COMPATIBILITY[group].includes(targetBlood),
    );

    // Si pas de groupes compatibles, retourner vide
    if (compatibleGroups.length === 0) {
      return [];
    }

    const haversine = `(
      6371 * acos(
        cos(radians(${userLat})) * cos(radians(\`profilDonneur\`.\`lat_actuelle\`)) *
        cos(radians(\`profilDonneur\`.\`long_actuelle\`) - radians(${userLong})) +
        sin(radians(${userLat})) * sin(radians(\`profilDonneur\`.\`lat_actuelle\`))
      )
    )`;

    try {
      const donors = await Utilisateur.findAll({
        where: { role: "donneur" },
        include: [
          {
            model: ProfilDonneur,
            as: "profilDonneur",
            where: {
              groupe_sanguin: compatibleGroups,
              [db.Sequelize.Op.and]: db.sequelize.where(db.sequelize.literal(haversine), '<=', safeRadius)
            },
            required: true,
          },
        ],
        attributes: {
          exclude: ["mot_de_passe", "id_centre"],
          include: [[db.sequelize.literal(haversine), 'distance']]
        },
        order: db.sequelize.literal('distance ASC'),
        // Pas de limite - tous les donneurs compatibles
      });

      return donors;
    } catch (error) {
      logger.error("searchDonors: erreur SQL", { error: error.message, params });
      return [];
    }
  }

  /**
   * Génère un token JWT
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id_utilisateur, 
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
  }
}

module.exports = new UserService();
