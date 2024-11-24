/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+.ts?$': ['ts-jest', {}],
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
};
