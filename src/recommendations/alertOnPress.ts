import { Alert } from 'react-native';
import type { RecommendationBase } from './core';

/** Default press behaviour for the assignment: surface the tapped card in an Alert. */
export function alertOnPress(item: RecommendationBase) {
  Alert.alert(item.title, item.subtitle ?? `Open ${item.type}`);
}
