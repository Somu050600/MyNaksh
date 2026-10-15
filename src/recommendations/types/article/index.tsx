import React from 'react';
import {
  CardShell,
  defineRecommendation,
  RecommendationBase,
  RecommendationCardProps,
} from '../../core';

export interface ArticleRecommendation extends RecommendationBase {
  type: 'article';
  meta?: { readMinutes?: number };
}

export function ArticleCard({
  item,
  onPress,
}: RecommendationCardProps<ArticleRecommendation>) {
  return (
    <CardShell
      icon="📖"
      accent="#B86A12"
      eyebrow="Article"
      title={item.title}
      subtitle={item.subtitle}
      cta="Read"
      onPress={() => onPress(item)}
    />
  );
}

export const articleRecommendation =
  defineRecommendation<ArticleRecommendation>({
    type: 'article',
    Card: ArticleCard,
  });
