import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.test.ts',
    '<rootDir>/__tests__/unit/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'components/**/*.tsx',
    '!lib/supabase/**',
  ],
}

export default createJestConfig(config)
