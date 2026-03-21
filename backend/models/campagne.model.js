module.exports = (sequelize, DataTypes) => {
    const Campagne = sequelize.define(
        "Campagne",
        {
            id_campagne: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            titre: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            groupe_sanguin_cible: {
                type: DataTypes.STRING(5),
                allowNull: true,
                comment: "Filtre de groupe sanguin utilisé lors du lancement",
            },
            donneurs_touches: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            statut: {
                type: DataTypes.ENUM("lancee", "terminee", "annulee"),
                defaultValue: "lancee",
            },
        },
        {
            tableName: "Campagnes",
            timestamps: true,
        },
    );

    Campagne.associate = (models) => {
        Campagne.belongsTo(models.Centre, {
            foreignKey: "id_centre",
            as: "centre",
        });
    };

    return Campagne;
};
