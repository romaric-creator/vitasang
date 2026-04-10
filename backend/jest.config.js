module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    'validation/**/*.js',
    '!**/*.test.js',
  ],
  verbose: true,
  testTimeout: 10000,
  detectOpenHandles: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '__tests__/integration/',
  ],
};
