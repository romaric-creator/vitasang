// Vérifier les variables d'environnement critiques
if (!process.env.DB_PASS) {
  throw new Error(
    "CRITIQUE: Variable d'environnement DB_PASS est obligatoire et non définie",
  );
}
if (!process.env.DB_USER) {
  throw new Error(
    "CRITIQUE: Variable d'environnement DB_USER est obligatoire et non définie. Si vous utilisez une base de données comme TiDB Cloud, assurez-vous que le nom d'utilisateur inclut le préfixe requis (ex: 'your_prefix.your_username').",
  );
}

module.exports = {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.DB_PORT || 3306,
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASS,
  DB: process.env.DB || "vitasang",
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
    },
  },
  pool: {
    max: 20,
    min: 2,
    acquire: 60000,
    idle: 10000,
  },
};
