module.exports = {
  preset: '@react-native/jest-preset',
  resolver: '<rootDir>/jest.resolver.js',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/web/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-.*|@react-navigation)/)',
  ],
};
