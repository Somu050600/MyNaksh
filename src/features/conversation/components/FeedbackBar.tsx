import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Chip } from '../../../shared/ui/Chip';
import { PressableScale } from '../../../shared/ui/PressableScale';
import { colors, radius, spacing } from '../../../shared/theme';
import { FEEDBACK_REASONS } from '../model/feedback';
import type { Feedback, Rating } from '../model/types';
import { useConversationStore } from '../store/instance';

interface Props {
  messageId: string;
  feedback: Feedback;
}

const RATINGS: Array<{ rating: Rating; emoji: string; label: string }> = [
  { rating: 'like', emoji: '👍', label: 'Like' },
  { rating: 'dislike', emoji: '👎', label: 'Dislike' },
];

export function FeedbackBar({ messageId, feedback }: Props) {
  const setRating = useConversationStore(s => s.setRating);
  const toggleReason = useConversationStore(s => s.toggleReason);

  return (
    <Animated.View layout={LinearTransition} style={styles.wrap}>
      <View style={styles.buttons}>
        {RATINGS.map(({ rating, emoji, label }) => {
          const active = feedback.rating === rating;
          return (
            <PressableScale
              key={rating}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
              onPress={() => setRating(messageId, rating)}
              style={[styles.button, active && styles.buttonActive]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </PressableScale>
          );
        })}
      </View>

      {feedback.rating === 'dislike' ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(120)}
          style={styles.reasons}
        >
          <Text style={styles.prompt}>What went wrong?</Text>
          <View style={styles.chips}>
            {FEEDBACK_REASONS.map(({ key, label }) => (
              <Chip
                key={key}
                label={label}
                selected={feedback.reasons.includes(key)}
                onPress={() => toggleReason(messageId, key)}
              />
            ))}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonActive: { borderColor: colors.primary, backgroundColor: '#ECE7FB' },
  emoji: { fontSize: 15 },
  reasons: { marginTop: spacing.sm },
  prompt: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
