import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import {
  alertOnPress,
  defaultRegistry,
  RecommendationProvider,
} from './src/recommendations';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {/* Registry + press handler are injected here; swap alertOnPress for navigation later. */}
      <RecommendationProvider registry={defaultRegistry} onPress={alertOnPress}>
        <RootNavigator />
      </RecommendationProvider>
    </SafeAreaProvider>
  );
}
