/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  // Inline babel options (instead of a root babel.config.js) so that
  // Next.js keeps using SWC for `next build` / `next dev`.
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-typescript', { allowDeclareFields: true }],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/out/'],
  collectCoverageFrom: ['lib/**/*.{ts,tsx}', '!lib/**/*.d.ts'],
  clearMocks: true,
}

module.exports = config