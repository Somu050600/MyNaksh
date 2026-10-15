import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { colors, spacing } from '../../../shared/theme';
import { senderName } from '../model/sender';
import { useConversationStore } from '../store/instance';

/** Strip above the composer showing the message being replied to. */
export function ReplyPreview() {
  const original = useConversationStore(s =>
    s.replyToId ? s.byId[s.replyToId] : undefined,
  );
  const clearReply = useConversationStore(s => s.clearReply);

  if (!original) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(160)}
      exiting={FadeOutDown.duration(120)}
      style={styles.strip}
    >
      <View style={styles.bar} />
      <View style={styles.body}>
        <Text style={styles.author}>Replying to {senderName(original)}</Text>
        <Text style={styles.snippet} numberOfLines={1}>
          {original.text}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel reply"
        hitSlop={10}
        onPress={clearReply}
      >
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#F1EEFA',
  },
  bar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  body: { flex: 1 },
  author: { fontSize: 12, fontWeight: '700', color: colors.primary },
  snippet: { fontSize: 13, color: colors.textMuted },
  close: { fontSize: 16, color: colors.textMuted },
});
