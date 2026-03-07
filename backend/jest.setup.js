// Jest Setup file
// Runs before all tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASS = 'root1234';
process.env.DB = 'vitasang_test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.PORT = 3001;

// Suppress info logs during tests
const originalLog = console.log;
console.log = (...args) => {
  if (!args[0]?.includes?.('info:') && !args[0]?.includes?.('[info]')) {
    originalLog(...args);
  }
};
