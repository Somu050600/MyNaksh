import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ActionSheet } from '../../features/conversation/components/ActionSheet';
import { Composer } from '../../features/conversation/components/Composer';
import { MessageList } from '../../features/conversation/components/MessageList';
import {
  EmptyView,
  ErrorView,
  LoadingView,
} from '../../features/conversation/components/StateViews';
import type { Message } from '../../features/conversation/model/types';
import { useConversationStore } from '../../features/conversation/store/instance';
import { colors } from '../../shared/theme';

interface Props {
  /** Space taken by the navigation header, so the keyboard avoids the composer correctly. */
  keyboardOffset?: number;
}

export function ChatScreen({ keyboardOffset = 0 }: Props) {
  const loadStatus = useConversationStore(s => s.loadStatus);
  const hasMessages = useConversationStore(s => s.ids.length > 0);
  const load = useConversationStore(s => s.load);
  const [selected, setSelected] = useState<Message | null>(null);
  const closeActions = useCallback(() => setSelected(null), []);

  useEffect(() => {
    load();
  }, [load]);

  let body: React.ReactNode;
  if (loadStatus === 'error') {
    body = <ErrorView onRetry={load} />;
  } else if (loadStatus !== 'ready') {
    body = <LoadingView />; // idle and loading look the same to the user
  } else if (!hasMessages) {
    body = <EmptyView />;
  } else {
    body = <MessageList onMessageLongPress={setSelected} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}
    >
      <View style={styles.body}>{body}</View>
      {loadStatus === 'ready' ? <Composer /> : null}
      <ActionSheet message={selected} onClose={closeActions} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
});
