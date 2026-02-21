module.exports = (sequelize, DataTypes) => {
  const TypeDon = sequelize.define(
    "TypeDon",
    {
      id_type_don: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      libelle: { type: DataTypes.STRING(50), allowNull: false },
      delai_attente_jours: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "Types_Don", timestamps: false },
  );

  TypeDon.associate = (models) => {
    TypeDon.hasMany(models.RendezVous, {
      foreignKey: "id_type_don",
      as: "rendezVous",
    });
    TypeDon.hasMany(models.HistoriqueDon, {
      foreignKey: "id_type_don",
      as: "historiqueDons",
    });
  };

  return TypeDon;
};
