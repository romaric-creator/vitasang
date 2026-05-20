module.exports = (sequelize, DataTypes) => {
  const Alerte = sequelize.define(
    "Alerte",
    {
      id_alerte: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      public_token: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      id_initiateur: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Utilisateurs', key: 'id_utilisateur' }
      },
      nom_patient: { type: DataTypes.STRING(100) },
      telephone_contact: { type: DataTypes.STRING(20) },
      id_centre: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Centres_Sante', key: 'id_centre' }
      },
      groupe_requis: {
        type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "INCONNU"),
      },
      degre_urgence: {
        type: DataTypes.ENUM("NORMAL", "URGENT", "TRES_URGENT"),
        defaultValue: "NORMAL",
      },
      rayon_action_km: { type: DataTypes.INTEGER, defaultValue: 20 },
      lieu: { type: DataTypes.STRING(255) },
      description: { type: DataTypes.TEXT },
      latitude: { type: DataTypes.DOUBLE },
      longitude: { type: DataTypes.DOUBLE },
      quantite_requise: { type: DataTypes.INTEGER, defaultValue: 1 },
      statut: {
        type: DataTypes.ENUM(
          "en_attente_validation",
          "en_cours",
          "resolu",
          "annule",
          "expire",
        ),
        defaultValue: "en_cours",
      },
    },
    {
      tableName: "Alertes_Urgence",
      timestamps: true,
      indexes: [{ fields: ["statut"] }]
    },
  );

  Alerte.associate = (models) => {
    // Une alerte peut déclencher plusieurs notifications
    Alerte.hasMany(models.LogNotification, {
      foreignKey: "id_alerte",
      as: "notifications",
    });

    // Une alerte est émise par un centre
    Alerte.belongsTo(models.Centre, {
      foreignKey: "id_centre",
      as: "centre",
    });

    // Une alerte est initiée par un utilisateur (personnel/admin)
    Alerte.belongsTo(models.Utilisateur, {
      foreignKey: "id_initiateur",
      as: "initiateur",
    });
  };

  return Alerte;
};
