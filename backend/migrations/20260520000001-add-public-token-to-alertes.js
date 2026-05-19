module.exports = {
  up: async (queryInterface) => {
    // TiDB: ADD COLUMN sans contrainte, puis backfill, puis index unique séparé
    await queryInterface.sequelize.query(
      'ALTER TABLE Alertes_Urgence ADD COLUMN public_token VARCHAR(36) NULL AFTER id_alerte'
    );
    await queryInterface.sequelize.query(
      'UPDATE Alertes_Urgence SET public_token = UUID() WHERE public_token IS NULL'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE Alertes_Urgence MODIFY COLUMN public_token VARCHAR(36) NOT NULL'
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX alertes_public_token_unique ON Alertes_Urgence (public_token)'
    );
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DROP INDEX alertes_public_token_unique ON Alertes_Urgence'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE Alertes_Urgence DROP COLUMN public_token'
    );
  }
};
