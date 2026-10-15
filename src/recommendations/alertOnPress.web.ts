import type { RecommendationBase } from './core';

// Web preview only: react-native-web's Alert.alert is a no-op, so use the browser dialog.
type AlertHost = { alert?: (message: string) => void };

export function alertOnPress(item: RecommendationBase) {
  (globalThis as unknown as AlertHost).alert?.(
    `${item.title}\n${item.subtitle ?? `Open ${item.type}`}`,
  );
}
