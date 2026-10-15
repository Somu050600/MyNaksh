module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must stay last: Reanimated 4 moved its worklet transform into react-native-worklets.
  plugins: ['react-native-worklets/plugin'],
};
