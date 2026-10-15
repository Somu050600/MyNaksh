import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
} from 'react-native';
import { buildTimeline, TimelineItem } from '../model/buildTimeline';
import type { Message } from '../model/types';
import { useConversationStore, useMessages } from '../store/instance';
import { TypingIndicator } from './bubbles/TypingIndicator';
import { DateSeparator } from './DateSeparator';
import { MessageRow } from './MessageRow';

interface Props {
  onMessageLongPress: (message: Message) => void;
}

const NEAR_BOTTOM_PX = 120;

const keyExtractor = (item: TimelineItem) => item.key;

/**
 * Inverted FlatList: offset 0 is the bottom, so the latest message is visible
 * on mount, and removing or adding items never yanks the viewport.
 */
export function MessageList({ onMessageLongPress }: Props) {
  const messages = useMessages();
  const aiTyping = useConversationStore(s => s.aiTyping);
  const listRef = useRef<FlatList<TimelineItem>>(null);
  const nearBottom = useRef(true);
  const lastCount = useRef(messages.length);

  // Inverted lists render data bottom-up, so feed the timeline newest-first.
  const data = useMemo(() => buildTimeline(messages).reverse(), [messages]);

  useEffect(() => {
    const grew = messages.length > lastCount.current;
    lastCount.current = messages.length;
    const newest = messages[messages.length - 1];
    // Always follow the user's own send; follow incoming only if they are near the bottom.
    if (grew && (nearBottom.current || newest?.type === 'user')) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    nearBottom.current = e.nativeEvent.contentOffset.y < NEAR_BOTTOM_PX;
  }, []);

  const renderItem = useCallback<ListRenderItem<TimelineItem>>(
    ({ item }) =>
      item.kind === 'date' ? (
        <DateSeparator label={item.label} />
      ) : (
        <MessageRow
          id={item.id}
          groupPos={item.groupPos}
          onOpenActions={onMessageLongPress}
        />
      ),
    [onMessageLongPress],
  );

  return (
    <FlatList
      ref={listRef}
      testID="message-list"
      inverted
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={aiTyping ? <TypingIndicator /> : undefined}
      onScroll={onScroll}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={12}
      maxToRenderPerBatch={8}
      windowSize={9}
      removeClippedSubviews={Platform.OS === 'android'}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12 },
});
