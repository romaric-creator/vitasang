'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Notifications_Log
      MODIFY COLUMN statut_reception ENUM(
        'envoye','lu','accepte','ignore','delivered','failed',
        'no_token','reçu','échec','refuse','don_effectue'
      ) NOT NULL DEFAULT 'envoye'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Notifications_Log
      MODIFY COLUMN statut_reception ENUM(
        'envoye','lu','accepte','ignore','delivered','failed',
        'no_token','reçu','échec','refuse'
      ) NOT NULL DEFAULT 'envoye'
    `);
  },
};
