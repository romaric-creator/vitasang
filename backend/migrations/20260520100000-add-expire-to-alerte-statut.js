'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Alertes_Urgence
      MODIFY COLUMN statut ENUM('en_attente_validation', 'en_cours', 'resolu', 'annule', 'expire')
      DEFAULT 'en_cours';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Alertes_Urgence
      MODIFY COLUMN statut ENUM('en_attente_validation', 'en_cours', 'resolu', 'annule')
      DEFAULT 'en_cours';
    `);
  },
};
