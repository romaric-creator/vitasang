module.exports = (sequelize, DataTypes) => {
  const HistoriqueDon = sequelize.define(
    "HistoriqueDon",
    {
      id_historique: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date_don: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      volume_ml: {
        type: DataTypes.INTEGER,
        comment: "Volume en millilitres",
      },
      statut_don: {
        type: DataTypes.ENUM("réussi", "échoué", "partiel"),
        defaultValue: "réussi",
      },
    },
    {
      tableName: "Historique_Dons",
      timestamps: false,
    },
  );

  HistoriqueDon.associate = (models) => {
    // Un don est fait par un utilisateur (donneur)
    HistoriqueDon.belongsTo(models.Utilisateur, {
      foreignKey: "id_donneur",
      as: "donneur",
    });

    // Un don est effectué dans un centre
    HistoriqueDon.belongsTo(models.Centre, {
      foreignKey: "id_centre",
      as: "centre",
    });

    // Un don a un type (sang total, plaquettes, etc.)
    HistoriqueDon.belongsTo(models.TypeDon, {
      foreignKey: "id_type_don",
      as: "typeDon",
    });
  };

  return HistoriqueDon;
};
