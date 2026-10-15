/* eslint-env jest */
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    setString: jest.fn(),
    getString: jest.fn(() => Promise.resolve('')),
  },
}));
