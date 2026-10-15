import React from 'react';
import {
  CardShell,
  defineRecommendation,
  RecommendationBase,
  RecommendationCardProps,
} from '../../core';

export interface PromotionRecommendation extends RecommendationBase {
  type: 'promotion';
  meta?: { code?: string };
}

export function PromotionCard({
  item,
  onPress,
}: RecommendationCardProps<PromotionRecommendation>) {
  return (
    <CardShell
      icon="🎁"
      accent="#D13A6A"
      eyebrow="Offer"
      title={item.title}
      subtitle={item.subtitle}
      cta="Claim"
      onPress={() => onPress(item)}
    />
  );
}

export const promotionRecommendation =
  defineRecommendation<PromotionRecommendation>({
    type: 'promotion',
    Card: PromotionCard,
  });
