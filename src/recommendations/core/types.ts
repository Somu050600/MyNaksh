import type { ComponentType } from 'react';

/**
 * Wire shape every recommendation shares. `type` is an open string on purpose:
 * the backend can ship a type this app version has never heard of, and the
 * carousel degrades to a generic card instead of failing.
 */
export interface RecommendationBase {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  /** Type-specific payload (e.g. planet for a gemstone). Narrowed per type. */
  meta?: Record<string, unknown>;
}

export interface RecommendationCardProps<
  T extends RecommendationBase = RecommendationBase,
> {
  item: T;
  onPress: (item: T) => void;
}

export interface RecommendationDefinition<
  T extends RecommendationBase = RecommendationBase,
> {
  type: T['type'];
  Card: ComponentType<RecommendationCardProps<T>>;
}

/**
 * Authoring helper: keeps `type` and the card's `item` prop linked to one
 * payload type, then erases it so definitions of different types fit in one
 * registry. The registry only dispatches on `type`, so the cast is safe.
 */
export function defineRecommendation<T extends RecommendationBase>(
  definition: RecommendationDefinition<T>,
): RecommendationDefinition {
  return definition as unknown as RecommendationDefinition;
}
