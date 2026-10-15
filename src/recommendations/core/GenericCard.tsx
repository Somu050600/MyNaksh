import React from 'react';
import { colors } from '../../shared/theme';
import { CardShell } from './CardShell';
import type { RecommendationCardProps } from './types';

function humanize(type: string) {
  const spaced = type.replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Renders any recommendation from the base fields alone. Used when the backend
 * sends a type this build has no definition for.
 */
export function GenericCard({ item, onPress }: RecommendationCardProps) {
  return (
    <CardShell
      icon="✨"
      accent={colors.primary}
      eyebrow={humanize(item.type)}
      title={item.title}
      subtitle={item.subtitle}
      onPress={() => onPress(item)}
    />
  );
}
