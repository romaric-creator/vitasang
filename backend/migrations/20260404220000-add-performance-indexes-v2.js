module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('ProfilDonneur', ['groupe_sanguin']);
    await queryInterface.addIndex('ProfilDonneur', ['disponible']);
    await queryInterface.addIndex('ProfilDonneur', ['lat_actuelle', 'long_actuelle']);
    await queryInterface.addIndex('ProfilDonneur', ['id_donneur']);
    
    await queryInterface.addIndex('Messages', ['id_expediteur']);
    await queryInterface.addIndex('Messages', ['id_destinataire']);
    await queryInterface.addIndex('Messages', ['createdAt']);
    
    await queryInterface.addIndex('Historique_Don', ['id_donneur']);
    await queryInterface.addIndex('Historique_Don', ['id_centre']);
    await queryInterface.addIndex('Historique_Don', ['date_don']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('ProfilDonneur', ['groupe_sanguin']);
    await queryInterface.removeIndex('ProfilDonneur', ['disponible']);
    await queryInterface.removeIndex('ProfilDonneur', ['lat_actuelle', 'long_actuelle']);
    await queryInterface.removeIndex('ProfilDonneur', ['id_donneur']);
    
    await queryInterface.removeIndex('Messages', ['id_expediteur']);
    await queryInterface.removeIndex('Messages', ['id_destinataire']);
    await queryInterface.removeIndex('Messages', ['createdAt']);
    
    await queryInterface.removeIndex('Historique_Don', ['id_donneur']);
    await queryInterface.removeIndex('Historique_Don', ['id_centre']);
    await queryInterface.removeIndex('Historique_Don', ['date_don']);
  }
};
