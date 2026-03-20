'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Profils_Donneurs
    await queryInterface.addColumn('Profils_Donneurs', 'disponible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.addColumn('Profils_Donneurs', 'raison_indisponibilite', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('Profils_Donneurs', 'date_disponibilite', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    // Notifications_Log
    await queryInterface.addColumn('Notifications_Log', 'push_token', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Notifications_Log', 'details_echec', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Notifications_Log', 'push_ticket_id', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Alertes_Urgence
    await queryInterface.addColumn('Alertes_Urgence', 'id_initiateur', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow true for migration, but it is effectively required via model
      references: { model: 'Utilisateurs', key: 'id_utilisateur' }
    });
    await queryInterface.addColumn('Alertes_Urgence', 'id_centre', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Centres_Sante', key: 'id_centre' }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Profils_Donneurs', 'disponible');
    await queryInterface.removeColumn('Profils_Donneurs', 'raison_indisponibilite');
    await queryInterface.removeColumn('Profils_Donneurs', 'date_disponibilite');

    await queryInterface.removeColumn('Notifications_Log', 'push_token');
    await queryInterface.removeColumn('Notifications_Log', 'details_echec');
    await queryInterface.removeColumn('Notifications_Log', 'push_ticket_id');

    await queryInterface.removeColumn('Alertes_Urgence', 'id_initiateur');
    await queryInterface.removeColumn('Alertes_Urgence', 'id_centre');
  }
};
