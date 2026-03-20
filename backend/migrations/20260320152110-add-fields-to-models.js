'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const profilsTable = await queryInterface.describeTable('Profils_Donneurs');
    if (!profilsTable.disponible) {
      await queryInterface.addColumn('Profils_Donneurs', 'disponible', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
    }
    if (!profilsTable.raison_indisponibilite) {
      await queryInterface.addColumn('Profils_Donneurs', 'raison_indisponibilite', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }
    if (!profilsTable.date_disponibilite) {
      await queryInterface.addColumn('Profils_Donneurs', 'date_disponibilite', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }

    const logsTable = await queryInterface.describeTable('Notifications_Log');
    if (!logsTable.push_token) {
      await queryInterface.addColumn('Notifications_Log', 'push_token', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!logsTable.details_echec) {
      await queryInterface.addColumn('Notifications_Log', 'details_echec', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!logsTable.push_ticket_id) {
      await queryInterface.addColumn('Notifications_Log', 'push_ticket_id', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    const alertsTable = await queryInterface.describeTable('Alertes_Urgence');
    if (!alertsTable.id_initiateur) {
      await queryInterface.addColumn('Alertes_Urgence', 'id_initiateur', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Utilisateurs', key: 'id_utilisateur' }
      });
    }
    if (!alertsTable.id_centre) {
      await queryInterface.addColumn('Alertes_Urgence', 'id_centre', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Centres_Sante', key: 'id_centre' }
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const profilsTable = await queryInterface.describeTable('Profils_Donneurs');
    if (profilsTable.disponible) await queryInterface.removeColumn('Profils_Donneurs', 'disponible');
    if (profilsTable.raison_indisponibilite) await queryInterface.removeColumn('Profils_Donneurs', 'raison_indisponibilite');
    if (profilsTable.date_disponibilite) await queryInterface.removeColumn('Profils_Donneurs', 'date_disponibilite');

    const logsTable = await queryInterface.describeTable('Notifications_Log');
    if (logsTable.push_token) await queryInterface.removeColumn('Notifications_Log', 'push_token');
    if (logsTable.details_echec) await queryInterface.removeColumn('Notifications_Log', 'details_echec');
    if (logsTable.push_ticket_id) await queryInterface.removeColumn('Notifications_Log', 'push_ticket_id');

    const alertsTable = await queryInterface.describeTable('Alertes_Urgence');
    if (alertsTable.id_initiateur) await queryInterface.removeColumn('Alertes_Urgence', 'id_initiateur');
    if (alertsTable.id_centre) await queryInterface.removeColumn('Alertes_Urgence', 'id_centre');
  }
};
