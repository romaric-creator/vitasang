module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Waitlist", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      source: { type: Sequelize.STRING(50), defaultValue: "landing_page" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("Waitlist");
  }
};
