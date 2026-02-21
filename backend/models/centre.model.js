module.exports = (sequelize, DataTypes) => {
  const Centre = sequelize.define(
    "Centre",
    {
      id_centre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom_centre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      adresse: {
        type: DataTypes.TEXT,
      },
      ville: {
        type: DataTypes.STRING(100),
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      contact_urgence: {
        type: DataTypes.STRING(20),
      },
      capacite_stockage_max: {
        type: DataTypes.INTEGER,
        comment: "Nombre maximum de poches que le centre peut contenir",
      },
    },
    {
      tableName: "Centres_Sante",
      timestamps: false,
    },
  );

  Centre.associate = (models) => {
    // Un centre a plusieurs membres du personnel (utilisateurs)
    Centre.hasMany(models.Utilisateur, {
      foreignKey: "id_centre",
      as: "personnel",
    });

    // Un centre gère plusieurs stocks de sang (un par groupe sanguin)
    Centre.hasMany(models.StockSang, {
      foreignKey: "id_centre",
      as: "stocks",
    });

    // Un centre peut émettre plusieurs alertes
    Centre.hasMany(models.Alerte, {
      foreignKey: "id_centre",
      as: "alertes",
    });

    // Un centre a plusieurs rendez-vous
    Centre.hasMany(models.RendezVous, {
      foreignKey: "id_centre",
      as: "rendezVous",
    });

    // Plusieurs dons peuvent être faits dans un centre
    Centre.hasMany(models.HistoriqueDon, {
      foreignKey: "id_centre",
      as: "historiqueDons",
    });
  };

  return Centre;
};
