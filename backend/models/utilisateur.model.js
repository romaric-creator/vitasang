module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      id_utilisateur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100) },
      region: { type: DataTypes.STRING(100) },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: null,
        validate: { isEmail: true },
      },
      mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
      telephone: { type: DataTypes.STRING(20), unique: true },
      role: {
        type: DataTypes.ENUM("donneur", "personnel", "admin"),
        defaultValue: "donneur",
      },
      push_token: { type: DataTypes.TEXT },
      est_actif: { type: DataTypes.BOOLEAN, defaultValue: true },
      id_centre: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Centres_Sante',
          key: 'id_centre'
        },
        allowNull: true
      },
      photo_profil: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
      }
    },
    { tableName: "Utilisateurs", timestamps: true },
  );

  Utilisateur.associate = (models) => {
    // Un utilisateur (donneur) a un profil de donneur
    Utilisateur.hasOne(models.ProfilDonneur, {
      foreignKey: "id_donneur",
      as: "profilDonneur",
    });

    // Un utilisateur (personnel) peut être rattaché à un centre
    Utilisateur.belongsTo(models.Centre, {
      foreignKey: "id_centre",
      allowNull: true, // Un donneur n'a pas d'id_centre
    });

    // Un utilisateur (donneur) a plusieurs historiques de dons
    Utilisateur.hasMany(models.HistoriqueDon, {
      foreignKey: "id_donneur",
      as: "historiqueDons",
    });

    // Un utilisateur (donneur) a plusieurs rendez-vous
    Utilisateur.hasMany(models.RendezVous, {
      foreignKey: "id_donneur",
      as: "rendezVous",
    });

    // Un utilisateur peut envoyer plusieurs messages
    Utilisateur.hasMany(models.Message, {
      foreignKey: "id_expediteur",
      as: "messagesEnvoyes",
    });

    // Un utilisateur peut recevoir plusieurs messages
    Utilisateur.hasMany(models.Message, {
      foreignKey: "id_destinataire",
      as: "messagesRecus",
    });
  };

  return Utilisateur;
};
