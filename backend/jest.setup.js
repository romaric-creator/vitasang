// Jest Setup file
// Runs before all tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.PORT = 3001;
process.env.DB_LOGGING = 'false';

// Suppress info logs during tests
const originalLog = console.log;
console.log = (...args) => {
  if (!args[0]?.includes?.('info:') && !args[0]?.includes?.('[info]')) {
    originalLog(...args);
  }
};
