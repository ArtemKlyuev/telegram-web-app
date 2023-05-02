/** @type {import('jest').Config} */
export default {
  roots: ['<rootDir>/src/'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^@typings/common$': '<rootDir>/src/typings/common.ts',
    '^@typings/utils$': '<rootDir>/src/typings/utils.ts',
    '^@typings/WebApp$': '<rootDir>/src/typings/WebApp.ts',
    '^@typings/WebView$': '<rootDir>/src/typings/WebView.ts',
    '^@Errors$': '<rootDir>/src/Errors/index.ts',
    '^@decorators$': '<rootDir>/src/decorators/index.ts',
    '^@utils$': '<rootDir>/src/utils/index.ts',
  },
  testEnvironment: 'jsdom',
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
