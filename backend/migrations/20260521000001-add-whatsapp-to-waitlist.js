module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Waitlist", "whatsapp", {
      type: Sequelize.STRING(30),
      allowNull: true,
      after: "email",
    });
    // email n'est plus obligatoire
    await queryInterface.changeColumn("Waitlist", "email", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Waitlist", "whatsapp");
    await queryInterface.changeColumn("Waitlist", "email", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
