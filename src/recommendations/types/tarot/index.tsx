import React from 'react';
import {
  CardShell,
  defineRecommendation,
  RecommendationBase,
  RecommendationCardProps,
} from '../../core';

export interface TarotRecommendation extends RecommendationBase {
  type: 'tarot';
  meta?: { spread?: string };
}

export function TarotCard({
  item,
  onPress,
}: RecommendationCardProps<TarotRecommendation>) {
  return (
    <CardShell
      icon="🔮"
      accent="#7A3FD0"
      eyebrow="Tarot Reading"
      title={item.title}
      subtitle={item.subtitle}
      cta="Draw cards"
      onPress={() => onPress(item)}
    />
  );
}

export const tarotRecommendation = defineRecommendation<TarotRecommendation>({
  type: 'tarot',
  Card: TarotCard,
});
