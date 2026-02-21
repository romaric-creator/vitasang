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
        type: DataTypes.ENUM("Normal", "Urgent", "Vital"),
        defaultValue: "Normal",
      },
      rayon_action_km: { type: DataTypes.INTEGER, defaultValue: 20 },
      statut: {
        type: DataTypes.ENUM("en_cours", "resolu", "annule"),
        defaultValue: "en_cours",
      },
    },
    { tableName: "Alertes_Urgence", timestamps: true },
  );

  Alerte.associate = (models) => {
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
