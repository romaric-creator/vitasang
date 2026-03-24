module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Index pour Alertes (Recherches géographiques et statuts)
    await queryInterface.addIndex('Alertes_Urgence', ['statut']);
    await queryInterface.addIndex('Alertes_Urgence', ['id_centre']);
    await queryInterface.addIndex('Alertes_Urgence', ['latitude', 'longitude']); // Composite pour la géo

    // Index pour RendezVous (Plannings et historiques)
    await queryInterface.addIndex('RendezVous', ['id_centre']);
    await queryInterface.addIndex('RendezVous', ['date_heure_rdv']);
    await queryInterface.addIndex('RendezVous', ['statut_rdv']);

    // Index pour Stock Sang (Inventaire rapide)
    await queryInterface.addIndex('Stock_Sang', ['id_centre']);
    await queryInterface.addIndex('Stock_Sang', ['groupe_sanguin']);

    // Index pour Utilisateurs (Connexion et Recherche)
    await queryInterface.addIndex('Utilisateurs', ['email']);
    await queryInterface.addIndex('Utilisateurs', ['telephone']);
    await queryInterface.addIndex('Utilisateurs', ['id_centre']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Alertes_Urgence', ['statut']);
    await queryInterface.removeIndex('Alertes_Urgence', ['id_centre']);
    await queryInterface.removeIndex('Alertes_Urgence', ['latitude', 'longitude']);
    await queryInterface.removeIndex('RendezVous', ['id_centre']);
    await queryInterface.removeIndex('RendezVous', ['date_heure_rdv']);
    await queryInterface.removeIndex('RendezVous', ['statut_rdv']);
    await queryInterface.removeIndex('Stock_Sang', ['id_centre']);
    await queryInterface.removeIndex('Stock_Sang', ['groupe_sanguin']);
    await queryInterface.removeIndex('Utilisateurs', ['email']);
    await queryInterface.removeIndex('Utilisateurs', ['telephone']);
    await queryInterface.removeIndex('Utilisateurs', ['id_centre']);
  }
};
