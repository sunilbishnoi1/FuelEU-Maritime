module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
    '^tests/mocks/(.*)$': '<rootDir>/src/tests/mocks/$1',
    '^tests/fixtures/(.*)$': '<rootDir>/src/tests/fixtures/$1',
    '^tests/setup/(.*)$': '<rootDir>/src/tests/setup/$1',
    '^domain/(.*)$': '<rootDir>/src/core/domain/$1',
    '^ports/(.*)$': '<rootDir>/src/core/ports/$1',
    '^application/(.*)$': '<rootDir>/src/core/application/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'esnext',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        isolatedModules: true,
      }
    }]
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts','js','json','node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json','lcov','text','clover'],
  verbose: true
};
