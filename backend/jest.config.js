module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^expo-server-sdk$': '<rootDir>/__mocks__/expo-server-sdk.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-server-sdk)/)'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    'validation/**/*.js',
    '!**/*.test.js',
  ],
  verbose: true,
  testTimeout: 10000,
};
