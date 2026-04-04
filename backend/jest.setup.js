// Jest Setup file - Tests utilisant l'API déployée sur Render

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'f4a7c1b5d9e382fa6cf2bd9087ea71a8123c5e8b';
process.env.PORT = 3001;

// URL de l'API déployée
const API_BASE_URL = 'https://vitasang.onrender.com/api';
process.env.API_BASE_URL = API_BASE_URL;

// Configuration pour les tests API (pas de SQLite)
process.env.DB_DIALECT = 'mysql';
process.env.DB_LOGGING = 'false';
process.env.HOST = 'gateway01.eu-central-1.prod.aws.tidbcloud.com';
process.env.DB_USER = 'eS49qYHfN2jBfa5.root';
process.env.DB_PASS = 'MsmJ1j86Tm3bJKPr';
process.env.DB = 'vitasang';
process.env.DB_PORT = '4000';

// Suppress info logs during tests
const originalLog = console.log;
console.log = (...args) => {
  if (!args[0]?.includes?.('info:') && !args[0]?.includes?.('[info]')) {
    originalLog(...args);
  }
};

global.API_BASE_URL = API_BASE_URL;
