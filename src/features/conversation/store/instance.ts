import { useMemo } from 'react';
import { useStore } from 'zustand';
import { createMockApi } from '../api/mockApi';
import type { Message } from '../model/types';
import {
  ConversationState,
  createConversationStore,
} from './conversationStore';

/** App-wide wiring: the store bound to the mock API. Swap `mockApi` for a real client here. */
export const mockApi = createMockApi();
export const conversationStore = createConversationStore(mockApi);

export function useConversationStore<T>(
  selector: (state: ConversationState) => T,
): T {
  return useStore(conversationStore, selector);
}

/** Messages in chronological order. Derived here so the store keeps one source of truth. */
export function useMessages(): Message[] {
  const ids = useConversationStore(s => s.ids);
  const byId = useConversationStore(s => s.byId);
  return useMemo(() => ids.map(id => byId[id]), [ids, byId]);
}
