// Jest configuration for a TypeScript project using ESM and jsdom environment

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // ESM + TS support
  preset: 'ts-jest/presets/js-with-ts-esm',

  // Browser-like test environment
  testEnvironment: 'jsdom',

  // Only scan your src/ folder
  roots: ['<rootDir>/src'],

  // Polyfills for TextEncoder/TextDecoder, fetch, BroadcastChannel
  setupFiles: ['<rootDir>/jest.polyfills.ts'],

  // Then load jest-dom matchers
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Compile TS, TSX, and JSX via ts-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          jsx: 'react-jsx'
        }
      }
    ]
  },

  // Transform ESM in msw and its interceptors so Jest can run them
  transformIgnorePatterns: ['node_modules/(?!msw|@mswjs/interceptors)/'],

  // Module alias, MSW mappings, and asset stubs
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },

  // Ignore these paths from tests
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Treat TS/TSX as ESM
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
