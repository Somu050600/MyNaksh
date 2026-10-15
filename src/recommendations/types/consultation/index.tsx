import React from 'react';
import {
  CardShell,
  defineRecommendation,
  RecommendationBase,
  RecommendationCardProps,
} from '../../core';

export interface ConsultationRecommendation extends RecommendationBase {
  type: 'consultation';
  meta?: { astrologerId?: string };
}

export function ConsultationCard({
  item,
  onPress,
}: RecommendationCardProps<ConsultationRecommendation>) {
  return (
    <CardShell
      icon="👨‍🏫"
      accent="#2E9E6B"
      eyebrow="Consultation"
      title={item.title}
      subtitle={item.subtitle}
      cta="Book now"
      onPress={() => onPress(item)}
    />
  );
}

export const consultationRecommendation =
  defineRecommendation<ConsultationRecommendation>({
    type: 'consultation',
    Card: ConsultationCard,
  });
