import { createRegistry } from './core';
import { builtInRecommendations } from './types';

export const defaultRegistry = createRegistry(builtInRecommendations);
