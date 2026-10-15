import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../shared/ui/PressableScale';
import { colors, radius, spacing } from '../../../shared/theme';

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>Loading conversation...</Text>
    </View>
  );
}

export function EmptyView() {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>🔮</Text>
      <Text style={styles.title}>Start your conversation.</Text>
      <Text style={styles.text}>Ask about your career, love or health.</Text>
    </View>
  );
}

export function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>📡</Text>
      <Text style={styles.title}>Unable to load conversation.</Text>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Retry"
        onPress={onRetry}
        style={styles.retry}
      >
        <Text style={styles.retryLabel}>Retry</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emoji: { fontSize: 40 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  text: { fontSize: 14, color: colors.textMuted },
  retry: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  retryLabel: { color: colors.primaryText, fontWeight: '700' },
});
