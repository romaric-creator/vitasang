module.exports = (sequelize, DataTypes) => {
  const StockSang = sequelize.define(
    "StockSang",
    {
      id_stock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      groupe_sanguin: {
        type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
        allowNull: false,
      },
      quantite_poches: { type: DataTypes.INTEGER, defaultValue: 0 },
      seuil_alerte_min: { type: DataTypes.INTEGER, defaultValue: 5 },
    },
    {
      tableName: "Stocks_Sang",
      timestamps: true,
    },
  );

  StockSang.associate = (models) => {
    // Un stock appartient à un centre
    StockSang.belongsTo(models.Centre, {
      foreignKey: "id_centre",
      as: "centre",
    });
  };

  return StockSang;
};
