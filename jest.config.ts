import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/services/',
    '<rootDir>/src/lib/',
    '\\.consumer\\.ts$',
    '\\.controller\\.ts$',
    '\\.repository\\.ts$',
    '\\.model\\.ts$',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/services/',
    '<rootDir>/src/lib/',
    '\\.consumer\\.ts$',
    '\\.controller\\.ts$',
    '\\.repository\\.ts$',
    '\\.model\\.ts$',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 1000000,
};
export default config;
