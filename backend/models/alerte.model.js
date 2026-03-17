module.exports = (sequelize, DataTypes) => {
  const Alerte = sequelize.define(
    "Alerte",
    {
      id_alerte: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      groupe_requis: {
        type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
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
        ),
        defaultValue: "en_attente_validation",
      },
    },
    { tableName: "Alertes_Urgence", timestamps: true },
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
