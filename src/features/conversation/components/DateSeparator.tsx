import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../shared/theme';

export function DateSeparator({ label }: { label: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    backgroundColor: '#ECE9F6',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
