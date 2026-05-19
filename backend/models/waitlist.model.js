module.exports = (sequelize, DataTypes) => {
  const Waitlist = sequelize.define("Waitlist", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    source: { type: DataTypes.STRING(50), defaultValue: "landing_page" },
  }, {
    tableName: "Waitlist",
    timestamps: true,
    indexes: [{ unique: true, fields: ["email"] }]
  });
  return Waitlist;
};
