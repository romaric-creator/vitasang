module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Notifications_Log', 'nom_guest', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('Notifications_Log', 'telephone_guest', { type: Sequelize.STRING(20), allowNull: true });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Notifications_Log', 'nom_guest');
    await queryInterface.removeColumn('Notifications_Log', 'telephone_guest');
  }
};
