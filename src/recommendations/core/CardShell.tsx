import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../shared/ui/PressableScale';
import { colors, radius, spacing } from '../../shared/theme';

export const CARD_WIDTH = 224;
export const CARD_GAP = spacing.sm;

interface Props {
  icon: string;
  accent: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta?: string;
  onPress: () => void;
}

/** Visual frame shared by every recommendation card so new types stay consistent. */
export function CardShell({
  icon,
  accent,
  eyebrow,
  title,
  subtitle,
  cta = 'View',
  onPress,
}: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${eyebrow}: ${title}`}
      onPress={onPress}
      style={styles.card}
    >
      <View style={[styles.badge, { backgroundColor: accent + '22' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
      <Text style={[styles.cta, { color: accent }]}>{cta} →</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: 150,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 18 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.xs,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: { marginTop: spacing.xs, fontSize: 13, color: colors.textMuted },
  cta: {
    marginTop: 'auto',
    paddingTop: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
  },
});
