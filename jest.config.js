/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['']
  },
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Transform configuration (updated syntax)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext'
      }
    }]
  },

  // Tell Jest to compile ESM modules including MSW and its dependencies
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@bundled-es-modules)/)'
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/'
  ],
   
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Static asset stub
    '\\.(css|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },

  // Handle ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};