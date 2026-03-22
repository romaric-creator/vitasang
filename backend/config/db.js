// Vérifier les variables d'environnement critiques (Sauf en mode test SQLite)
const isTestSQLite = process.env.NODE_ENV === 'test' && process.env.DB_DIALECT === 'sqlite';

if (!isTestSQLite) {
  if (!process.env.DB_PASS) {
    throw new Error(
      "CRITIQUE: Variable d'environnement DB_PASS est obligatoire et non définie",
    );
  }
  if (!process.env.DB_USER) {
    throw new Error(
      "CRITIQUE: Variable d'environnement DB_USER est obligatoire et non définie.",
    );
  }
}

module.exports = {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.DB_PORT || 3306,
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASS,
  DB: process.env.DB || "vitasang",
  dialect: process.env.DB_DIALECT || "mysql",
  storage: process.env.DB_STORAGE, // Pour SQLite
  dialectOptions: {
    ssl: process.env.DB_DIALECT === "sqlite" ? false : {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
    },
  },
  pool: {
    max: 5, // Réduit pour éviter "Too many connections" sur Render (Free/Starter)
    min: 0, // Permet de fermer toutes les connexions si inactives (économie ressources)
    acquire: 30000,
    idle: 10000,
  },
};
