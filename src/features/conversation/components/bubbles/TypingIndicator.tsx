import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing } from '../../../../shared/theme';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350 }),
          withTiming(0.3, { duration: 350 }),
        ),
        -1,
      ),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <View accessibilityLabel="AI Astrologer is typing" style={styles.wrap}>
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubble: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.aiBubble,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
});
