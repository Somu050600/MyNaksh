import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';
import type { BubbleProps } from './types';

export function SystemEvent({ message }: BubbleProps<'system'>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  text: { fontSize: 12, color: colors.system, textAlign: 'center' },
});
