// Dev-only entry for the react-native-web preview. Native builds use index.js.
import { AppRegistry } from 'react-native';
import App from '../App';

AppRegistry.registerComponent('MyNakshChat', () => App);
AppRegistry.runApplication('MyNakshChat', {
  initialProps: {},
  // react-native-web takes a DOM node; RN's own typings expect a native root tag.
  rootTag: document.getElementById('root') as never,
});
