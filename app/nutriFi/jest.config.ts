import type { Config } from 'jest'
import { createJsWithBabelPreset } from 'ts-jest'

const jsWithBabelPreset = createJsWithBabelPreset({
  tsconfig: 'tsconfig.spec.json',
  babelConfig: true,
})

const jestConfig: Config = {
  preset: 'react-native',
  transform: jsWithBabelPreset.transform,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  // Transform Expo and React Native modules instead of ignoring them
  transformIgnorePatterns: [
    'node_modules/(?!(expo|expo-router|expo-modules-core|@expo|react-native|@react-native|@react-navigation)/)',
  ],
}

export default jestConfig