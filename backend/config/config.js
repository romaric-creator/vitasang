require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASS,
        database: process.env.DB || "vitasang",
        host: process.env.HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        dialectOptions: process.env.HOST && process.env.HOST.includes("tidbcloud") ? {
            ssl: { rejectUnauthorized: true }
        } : undefined
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB,
        host: process.env.HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        dialectOptions: {
            ssl: {
                rejectUnauthorized: true
            }
        }
    }
};
