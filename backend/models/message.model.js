module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      id_message: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      contenu: { type: DataTypes.TEXT },
      est_lu: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "Messages", timestamps: true },
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Utilisateur, {
      foreignKey: "id_expediteur",
      as: "expediteur",
    });
    Message.belongsTo(models.Utilisateur, {
      foreignKey: "id_destinataire",
      as: "destinataire",
    });
  };

  return Message;
};
