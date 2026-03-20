'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Alertes_Urgence', 'nom_patient', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('Alertes_Urgence', 'telephone_contact', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Alertes_Urgence', 'nom_patient');
        await queryInterface.removeColumn('Alertes_Urgence', 'telephone_contact');
    }
};
