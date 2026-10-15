import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { createRegistry, RecommendationRegistry } from './registry';
import type { RecommendationBase } from './types';

interface RecommendationContextValue {
  registry: RecommendationRegistry;
  onPress: (item: RecommendationBase) => void;
}

const RecommendationContext = createContext<RecommendationContextValue>({
  registry: createRegistry(),
  onPress: () => {},
});

interface Props extends RecommendationContextValue {
  children: ReactNode;
}

/**
 * Injects the registry and the press handler. The host app decides what a tap
 * does (Alert today, navigation later) without the cards knowing.
 */
export function RecommendationProvider({ registry, onPress, children }: Props) {
  const value = useMemo(() => ({ registry, onPress }), [registry, onPress]);
  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendationContext() {
  return useContext(RecommendationContext);
}
