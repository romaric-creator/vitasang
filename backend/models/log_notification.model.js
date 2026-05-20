module.exports = (sequelize, DataTypes) => {
  const LogNotification = sequelize.define(
    "LogNotification",
    {
      id_notification: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date_envoi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      statut_reception: {
        type: DataTypes.ENUM("envoye", "lu", "accepte", "ignore", "delivered", "failed", "no_token", "reçu", "échec", "refuse", "don_effectue"),
        defaultValue: "envoye",
      },
      canal: { type: DataTypes.ENUM("push", "email", "sms", "whatsapp") },
      push_token: { type: DataTypes.TEXT, allowNull: true },
      details_echec: { type: DataTypes.TEXT, allowNull: true },
      push_ticket_id: { type: DataTypes.STRING(100), allowNull: true },
      nom_guest: { type: DataTypes.STRING(100), allowNull: true },
      telephone_guest: { type: DataTypes.STRING(20), allowNull: true },
    },
    {
      tableName: "Notifications_Log",
      timestamps: false,
      indexes: [{ fields: ["id_alerte"] }]
    },
  );

  LogNotification.associate = (models) => {
    // Une notification est envoyée à un utilisateur
    LogNotification.belongsTo(models.Utilisateur, {
      foreignKey: "id_utilisateur",
      as: "destinataire",
    });

    // Une notification peut être déclenchée par une alerte
    LogNotification.belongsTo(models.Alerte, {
      foreignKey: "id_alerte",
      as: "alerte",
      allowNull: true, // Une notification n'est pas toujours liée à une alerte
    });
  };

  return LogNotification;
};
