import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';
import { useConversationStore } from '../../store/instance';
import { senderName } from '../../model/sender';

interface Props {
  replyToId: string;
  /** Quote sits on a light or dark bubble. */
  onDark?: boolean;
}

/** Snippet of the message being replied to, shown inside the replying bubble. */
export function QuotedReply({ replyToId, onDark = false }: Props) {
  const original = useConversationStore(s => s.byId[replyToId]);
  const barColor = onDark ? 'rgba(255,255,255,0.7)' : colors.primary;
  const textColor = onDark ? 'rgba(255,255,255,0.85)' : colors.textMuted;

  return (
    <View style={[styles.quote, { borderLeftColor: barColor }]}>
      <Text
        style={[
          styles.author,
          { color: onDark ? colors.primaryText : colors.primary },
        ]}
      >
        {original ? senderName(original) : 'Message'}
      </Text>
      <Text style={[styles.snippet, { color: textColor }]} numberOfLines={2}>
        {original ? original.text : 'Original message was deleted'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quote: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  author: { fontSize: 12, fontWeight: '700' },
  snippet: { fontSize: 13 },
});
