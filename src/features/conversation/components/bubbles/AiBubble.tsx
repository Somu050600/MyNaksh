import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecommendationCarousel } from '../../../../recommendations';
import { colors, spacing } from '../../../../shared/theme';
import { formatTime } from '../../../../shared/utils/date';
import { FeedbackBar } from '../FeedbackBar';
import { BubbleFrame } from './BubbleFrame';
import { QuotedReply } from './QuotedReply';
import type { BubbleProps } from './types';

export function AiBubble({ message, groupPos }: BubbleProps<'ai'>) {
  const opensGroup = groupPos === 'single' || groupPos === 'first';

  return (
    <View style={styles.row}>
      {opensGroup ? <Text style={styles.name}>✨ AI Astrologer</Text> : null}
      <BubbleFrame
        align="left"
        backgroundColor={colors.aiBubble}
        groupPos={groupPos}
      >
        {message.replyToId ? (
          <QuotedReply replyToId={message.replyToId} />
        ) : null}
        <Text style={styles.text}>{message.text}</Text>
      </BubbleFrame>

      {message.recommendations.length > 0 ? (
        <View style={styles.recommendations}>
          <RecommendationCarousel
            messageId={message.id}
            items={message.recommendations}
          />
        </View>
      ) : null}

      <FeedbackBar messageId={message.id} feedback={message.feedback} />
      <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start' },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 3,
  },
  text: { fontSize: 15, lineHeight: 21, color: colors.text },
  recommendations: { alignSelf: 'stretch', marginTop: spacing.sm },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
});
