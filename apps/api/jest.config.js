/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^@tna/types$': '<rootDir>/../../../packages/types/src/index.ts',
  },
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!main.ts'],
};
