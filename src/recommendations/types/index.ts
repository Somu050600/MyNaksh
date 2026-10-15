import { articleRecommendation } from './article';
import { consultationRecommendation } from './consultation';
import { gemstoneRecommendation } from './gemstone';
import { promotionRecommendation } from './promotion';
import { tarotRecommendation } from './tarot';

/**
 * Every recommendation type this app build knows how to render.
 * To add one: create types/<name>/index.tsx and list it here. Nothing else changes.
 */
export const builtInRecommendations = [
  gemstoneRecommendation,
  tarotRecommendation,
  consultationRecommendation,
  articleRecommendation,
  promotionRecommendation,
];
