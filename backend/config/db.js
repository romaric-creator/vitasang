module.exports = {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.DB_PORT || 3306,
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASS || "root1234",
  DB: process.env.DB || "vitasang",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
