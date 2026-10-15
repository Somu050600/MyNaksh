import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../../shared/theme';
import { formatTime } from '../../../../shared/utils/date';
import { BubbleFrame } from './BubbleFrame';
import { QuotedReply } from './QuotedReply';
import type { BubbleProps } from './types';

export function HumanBubble({ message, groupPos }: BubbleProps<'human'>) {
  const opensGroup = groupPos === 'single' || groupPos === 'first';
  const closesGroup = groupPos === 'single' || groupPos === 'last';

  return (
    <View style={styles.row}>
      {opensGroup ? (
        <View style={styles.header}>
          <Text style={styles.name}>{message.authorName}</Text>
          <Text style={styles.badge}>Astrologer</Text>
        </View>
      ) : null}
      <BubbleFrame
        align="left"
        backgroundColor={colors.humanBubble}
        groupPos={groupPos}
      >
        {message.replyToId ? (
          <QuotedReply replyToId={message.replyToId} />
        ) : null}
        <Text style={styles.text}>{message.text}</Text>
      </BubbleFrame>
      {closesGroup ? (
        <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 3,
  },
  name: { fontSize: 12, fontWeight: '700', color: colors.success },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  text: { fontSize: 15, lineHeight: 21, color: colors.text },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
});
