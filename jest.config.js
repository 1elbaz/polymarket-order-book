/** @type {import('ts-jest').JestConfigWithTsJest} */
const mswNode = require.resolve('msw/node');

module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Tell Jest to compile ESM in msw and its interceptors
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs/interceptors)/)'
  ],
  // Still don’t run tests in node_modules or .next
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/'
  ],
   
  moduleNameMapper: {
    // ← NO leading or trailing slashes around the regex here!
    '^@/(.*)$': '<rootDir>/src/$1',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    // static‐asset stub
    '\\.(css|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },

};
