import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { spacing } from '../../../shared/theme';
import type { GroupPos } from '../model/buildTimeline';
import type { Message } from '../model/types';
import { useConversationStore } from '../store/instance';
import { getMessageDefinition } from './messageRegistry';

interface Props {
  id: string;
  groupPos: GroupPos;
  onOpenActions: (message: Message) => void;
}

/**
 * Subscribes to its own message by id and takes only primitives as props, so
 * memo skips it unless that one message (or its group position) changes.
 */
export const MessageRow = memo(function MessageRowBase({
  id,
  groupPos,
  onOpenActions,
}: Props) {
  const message = useConversationStore(s => s.byId[id]);
  if (!message) {
    return null;
  }

  const { Component, actions } = getMessageDefinition(message);
  const spacingStyle =
    groupPos === 'single' || groupPos === 'first'
      ? styles.groupStart
      : styles.grouped;
  const content = <Component message={message} groupPos={groupPos} />;

  if (actions.length === 0) {
    return (
      <View testID={`message-${id}`} style={[styles.row, spacingStyle]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={`message-${id}`}
      delayLongPress={350}
      onLongPress={() => onOpenActions(message)}
      style={[styles.row, spacingStyle]}
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md },
  groupStart: { marginTop: spacing.sm },
  grouped: { marginTop: 2 },
});
