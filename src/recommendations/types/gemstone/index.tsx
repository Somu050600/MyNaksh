import React from 'react';
import {
  CardShell,
  defineRecommendation,
  RecommendationBase,
  RecommendationCardProps,
} from '../../core';

export interface GemstoneRecommendation extends RecommendationBase {
  type: 'gemstone';
  meta?: { planet?: string };
}

export function GemstoneCard({
  item,
  onPress,
}: RecommendationCardProps<GemstoneRecommendation>) {
  return (
    <CardShell
      icon="💎"
      accent="#2B6CB0"
      eyebrow="Gemstone"
      title={item.title}
      subtitle={item.subtitle}
      cta="Explore"
      onPress={() => onPress(item)}
    />
  );
}

export const gemstoneRecommendation =
  defineRecommendation<GemstoneRecommendation>({
    type: 'gemstone',
    Card: GemstoneCard,
  });
