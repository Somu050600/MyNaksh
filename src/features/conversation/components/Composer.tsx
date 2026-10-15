import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../../shared/ui/PressableScale';
import { colors, radius, spacing } from '../../../shared/theme';
import { useConversationStore } from '../store/instance';
import { ReplyPreview } from './ReplyPreview';

export function Composer() {
  const [text, setText] = useState('');
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const send = useConversationStore(s => s.send);
  const replyToId = useConversationStore(s => s.replyToId);
  const canSend = text.trim().length > 0;

  // Tapping "Reply" should leave the user ready to type.
  useEffect(() => {
    if (replyToId) {
      inputRef.current?.focus();
    }
  }, [replyToId]);

  const submit = () => {
    if (!canSend) {
      return;
    }
    send(text);
    setText('');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ReplyPreview />
      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          testID="composer-input"
          accessibilityLabel="Message"
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message AI Astrologer"
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={submit}
          style={[styles.send, !canSend && styles.sendDisabled]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    fontSize: 15,
    color: colors.text,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.border },
  sendIcon: { color: colors.primaryText, fontSize: 16 },
});
