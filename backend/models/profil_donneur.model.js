module.exports = (sequelize, DataTypes) => {
  const ProfilDonneur = sequelize.define(
    "ProfilDonneur",
    {
      id_donneur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Utilisateurs", // Nom de la table, pas du modèle
          key: "id_utilisateur",
        },
      },
      groupe_sanguin: {
        type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
        allowNull: false,
      },
      poids: { type: DataTypes.DECIMAL(5, 2) },
      taille: { type: DataTypes.DECIMAL(5, 2) },
      dernier_don: { type: DataTypes.DATEONLY },
      prochain_don_possible: { type: DataTypes.DATEONLY },
      lat_actuelle: { type: DataTypes.DOUBLE, allowNull: true },
      long_actuelle: { type: DataTypes.DOUBLE, allowNull: true },
    },
    {
      tableName: "Profils_Donneurs",
      timestamps: false,
      indexes: [{ fields: ["groupe_sanguin"] }]
    },
  );

  ProfilDonneur.associate = (models) => {
    ProfilDonneur.belongsTo(models.Utilisateur, {
      foreignKey: "id_donneur",
      as: "utilisateur",
    });
  };

  return ProfilDonneur;
};
