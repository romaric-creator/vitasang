module.exports = (sequelize, DataTypes) => {
  const Waitlist = sequelize.define("Waitlist", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
    whatsapp: { type: DataTypes.STRING(30), allowNull: true },
    source: { type: DataTypes.STRING(50), defaultValue: "landing_page" },
  }, {
    tableName: "Waitlist",
    timestamps: true,
  });
  return Waitlist;
};
