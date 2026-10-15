import React from 'react';
import { BottomSheet, SheetButton } from '../../../shared/ui/BottomSheet';
import { copyToClipboard } from '../../../shared/clipboard';
import type { Message, MessageAction } from '../model/types';
import { useConversationStore } from '../store/instance';
import { getAllowedActions } from './messageRegistry';

const ACTION_META: Record<
  MessageAction,
  { label: string; emoji: string; destructive?: boolean }
> = {
  reply: { label: 'Reply', emoji: '↩️' },
  copy: { label: 'Copy', emoji: '📋' },
  delete: { label: 'Delete', emoji: '🗑️', destructive: true },
};

interface Props {
  /** The long-pressed message, or null when the sheet is closed. */
  message: Message | null;
  onClose: () => void;
}

export function ActionSheet({ message, onClose }: Props) {
  const setReply = useConversationStore(s => s.setReply);
  const remove = useConversationStore(s => s.remove);

  const run = (action: MessageAction, target: Message) => {
    switch (action) {
      case 'reply':
        setReply(target.id);
        break;
      case 'copy':
        copyToClipboard(target.text);
        break;
      case 'delete':
        remove(target.id);
        break;
    }
    onClose();
  };

  return (
    <BottomSheet
      visible={message !== null}
      onClose={onClose}
      title={message?.text}
    >
      {message
        ? getAllowedActions(message).map(action => (
            <SheetButton
              key={action}
              label={ACTION_META[action].label}
              emoji={ACTION_META[action].emoji}
              destructive={ACTION_META[action].destructive}
              onPress={() => run(action, message)}
            />
          ))
        : null}
    </BottomSheet>
  );
}
