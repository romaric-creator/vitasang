module.exports = (sequelize, DataTypes) => {
  const RendezVous = sequelize.define(
    "RendezVous",
    {
      id_rdv: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date_heure_rdv: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      statut_rdv: {
        type: DataTypes.ENUM("planifie", "valide", "absent", "annule", "confirme", "effectue"),
        defaultValue: "planifie",
      },
      code_unique: {
        type: DataTypes.STRING(12),
        allowNull: true,
        comment: "Code QR ou texte pour l'arrivée au centre",
      },
    },
    {
      tableName: "Rendez_Vous",
      timestamps: true,
      indexes: [{ fields: ["statut_rdv"] }]
    },
  );

  RendezVous.associate = (models) => {
    // Un RDV est pris par un utilisateur (donneur)
    RendezVous.belongsTo(models.Utilisateur, {
      foreignKey: "id_donneur",
      as: "donneur",
    });

    // Un RDV a lieu dans un centre
    RendezVous.belongsTo(models.Centre, {
      foreignKey: "id_centre",
      as: "centre",
    });

    // Un RDV concerne un type de don
    RendezVous.belongsTo(models.TypeDon, {
      foreignKey: "id_type_don",
      as: "typeDon",
    });
  };

  return RendezVous;
};
