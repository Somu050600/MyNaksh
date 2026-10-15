import { MOCK_CONVERSATION } from '../api/mockData';
import { normalizeConversation } from '../api/normalize';
import type { Message } from '../model/types';
import { conversationStore } from '../store/instance';

/** Test helper: puts the singleton store into a known state. */
export function resetStore(
  messages: Message[] = [],
  loadStatus: 'idle' | 'ready' = 'ready',
) {
  conversationStore.setState({
    ids: messages.map(m => m.id),
    byId: Object.fromEntries(messages.map(m => [m.id, m])),
    loadStatus,
    replyToId: null,
    aiTyping: false,
  });
}

export function mockMessages(): Message[] {
  return normalizeConversation(MOCK_CONVERSATION, Date.now());
}

export function seedStore() {
  resetStore(mockMessages());
}
