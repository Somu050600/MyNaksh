/**
 * Chains the React Native preset resolver with Reanimated's. Reanimated 4 and
 * react-native-worklets need Jest to pick their non-native (JS) implementations,
 * otherwise they try to load the missing native module.
 */
const rnResolver = require('@react-native/jest-preset/jest/resolver.js');
const reanimatedResolver = require('react-native-reanimated/jest/resolver');

module.exports = (request, options) => {
  const touchesReanimated =
    request.includes('react-native-reanimated') ||
    request.includes('react-native-worklets') ||
    options.basedir.includes('react-native-reanimated') ||
    options.basedir.includes('react-native-worklets');

  return touchesReanimated
    ? reanimatedResolver(request, options)
    : rnResolver(request, options);
};
