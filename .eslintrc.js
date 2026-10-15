module.exports = {
  root: true,
  extends: '@react-native',
  // The RN ESLint config only wires its TypeScript parser to .ts/.tsx. The dev-only
  // Vite config is .mts (ESM), so it is excluded here and only ever run by Vite.
  ignorePatterns: ['web/dist/', 'web/vite.config.mts'],
};
