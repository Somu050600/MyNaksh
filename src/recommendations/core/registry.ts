import type { RecommendationDefinition } from './types';

export interface RecommendationRegistry {
  register(definition: RecommendationDefinition): void;
  resolve(type: string): RecommendationDefinition | undefined;
  has(type: string): boolean;
}

export function createRegistry(
  definitions: RecommendationDefinition[] = [],
): RecommendationRegistry {
  const byType = new Map<string, RecommendationDefinition>();

  const registry: RecommendationRegistry = {
    register(definition) {
      byType.set(definition.type, definition);
    },
    resolve: type => byType.get(type),
    has: type => byType.has(type),
  };

  definitions.forEach(registry.register);
  return registry;
}
