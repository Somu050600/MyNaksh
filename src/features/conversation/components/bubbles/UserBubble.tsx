import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';
import { formatTime } from '../../../../shared/utils/date';
import { useConversationStore } from '../../store/instance';
import { BubbleFrame } from './BubbleFrame';
import { QuotedReply } from './QuotedReply';
import type { BubbleProps } from './types';

export function UserBubble({ message, groupPos }: BubbleProps<'user'>) {
  const retry = useConversationStore(s => s.retry);
  const closesGroup = groupPos === 'single' || groupPos === 'last';
  const showFooter = closesGroup || message.status !== 'sent';

  return (
    <View style={styles.row}>
      <BubbleFrame
        align="right"
        backgroundColor={colors.userBubble}
        groupPos={groupPos}
      >
        {message.replyToId ? (
          <QuotedReply replyToId={message.replyToId} onDark />
        ) : null}
        <Text style={styles.text}>{message.text}</Text>
      </BubbleFrame>

      {showFooter ? (
        <View style={styles.footer}>
          {message.status === 'sending' ? (
            <Text style={styles.meta}>Sending…</Text>
          ) : null}
          {message.status === 'sent' ? (
            <Text style={styles.meta}>
              Sent · {formatTime(message.createdAt)}
            </Text>
          ) : null}
          {message.status === 'failed' ? (
            <>
              <Text style={[styles.meta, styles.failed]}>Failed to send</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry sending message"
                hitSlop={8}
                onPress={() => retry(message.id)}
              >
                <Text style={styles.retry}>Retry</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-end' },
  text: { fontSize: 15, lineHeight: 21, color: colors.primaryText },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 3,
  },
  meta: { fontSize: 11, color: colors.textMuted },
  failed: { color: colors.danger },
  retry: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
