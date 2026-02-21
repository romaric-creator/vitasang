module.exports = {
  HOST: process.env.HOST || "localhost",
  USER: process.env.USERS || "root",
  PASSWORD: process.env.PASSWORD || "root1234",
  DB: process.env.DB || "vitasang",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
