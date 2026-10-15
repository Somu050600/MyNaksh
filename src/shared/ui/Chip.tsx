import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { PressableScale } from './PressableScale';

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected = false, onPress }: Props) {
  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 13, color: colors.text },
  selectedLabel: { color: colors.primaryText, fontWeight: '600' },
});
