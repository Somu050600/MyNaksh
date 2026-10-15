import { createStore, StoreApi } from 'zustand/vanilla';
import type { ConversationApi } from '../api/types';
import type {
  FeedbackReason,
  LoadStatus,
  Message,
  Rating,
  UserMessage,
} from '../model/types';

export interface ConversationState {
  /** Chronological order. Messages live in `byId` so one update touches one row. */
  ids: string[];
  byId: Record<string, Message>;
  loadStatus: LoadStatus;
  replyToId: string | null;
  aiTyping: boolean;

  load(): Promise<void>;
  send(text: string): Promise<void>;
  retry(id: string): Promise<void>;
  remove(id: string): void;
  setReply(id: string): void;
  clearReply(): void;
  setRating(id: string, rating: Rating): void;
  toggleReason(id: string, reason: FeedbackReason): void;
}

interface Deps {
  now?: () => number;
  createId?: () => string;
}

const indexById = (messages: Message[]) =>
  messages.reduce<Record<string, Message>>((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {});

/**
 * Factory so tests (and a future real backend) inject the API instead of
 * mocking modules. The app uses the singleton built in ./instance.
 */
export function createConversationStore(
  api: ConversationApi,
  { now = Date.now, createId }: Deps = {},
): StoreApi<ConversationState> {
  let idSeq = 0;
  const nextId = createId ?? (() => `local-${now()}-${++idSeq}`);
  let loadSeq = 0;
  let pendingReplies = 0;

  return createStore<ConversationState>()((set, get) => {
    /** Immutable single-message update; a no-op (same state ref) when nothing changes. */
    const patch = (id: string, update: (message: Message) => Message | null) =>
      set(state => {
        const current = state.byId[id];
        const next = current ? update(current) : null;
        if (!next || next === current) {
          return state;
        }
        return { byId: { ...state.byId, [id]: next } };
      });

    const patchUser = (id: string, changes: Partial<UserMessage>) =>
      patch(id, m => (m.type === 'user' ? { ...m, ...changes } : null));

    const requestAiReply = async (text: string) => {
      pendingReplies += 1;
      set({ aiTyping: true });
      try {
        const reply = await api.fetchAiReply(text);
        set(state => ({
          ids: [...state.ids, reply.id],
          byId: { ...state.byId, [reply.id]: reply },
        }));
      } catch {
        // A missing AI reply is not worth surfacing; the user's message is already sent.
      } finally {
        pendingReplies -= 1;
        set({ aiTyping: pendingReplies > 0 });
      }
    };

    const deliver = async (id: string, text: string) => {
      try {
        await api.sendMessage(text);
      } catch {
        patchUser(id, { status: 'failed' });
        return;
      }
      patchUser(id, { status: 'sent' });
      // Skip the reply if the user deleted their message while it was in flight.
      if (get().byId[id]) {
        await requestAiReply(text);
      }
    };

    return {
      ids: [],
      byId: {},
      loadStatus: 'idle',
      replyToId: null,
      aiTyping: false,

      async load() {
        const mine = ++loadSeq;
        set({ loadStatus: 'loading' });
        try {
          const messages = await api.fetchConversation();
          if (mine !== loadSeq) {
            return; // a newer load superseded this one
          }
          set({
            ids: messages.map(m => m.id),
            byId: indexById(messages),
            replyToId: null,
            loadStatus: 'ready',
          });
        } catch {
          if (mine === loadSeq) {
            set({ loadStatus: 'error' });
          }
        }
      },

      async send(text) {
        const trimmed = text.trim();
        if (!trimmed) {
          return;
        }
        const { replyToId } = get();
        const message: UserMessage = {
          id: nextId(),
          type: 'user',
          text: trimmed,
          createdAt: now(),
          status: 'sending',
          ...(replyToId ? { replyToId } : {}),
        };
        set(state => ({
          ids: [...state.ids, message.id],
          byId: { ...state.byId, [message.id]: message },
          replyToId: null,
        }));
        await deliver(message.id, trimmed);
      },

      async retry(id) {
        const message = get().byId[id];
        if (message?.type !== 'user' || message.status !== 'failed') {
          return;
        }
        patchUser(id, { status: 'sending' });
        await deliver(id, message.text);
      },

      remove(id) {
        set(state => {
          if (!state.byId[id]) {
            return state;
          }
          const byId = { ...state.byId };
          delete byId[id];
          return {
            byId,
            ids: state.ids.filter(existing => existing !== id),
            replyToId: state.replyToId === id ? null : state.replyToId,
          };
        });
      },

      setReply(id) {
        if (get().byId[id]) {
          set({ replyToId: id });
        }
      },

      clearReply() {
        set({ replyToId: null });
      },

      setRating(id, rating) {
        patch(id, m => {
          if (m.type !== 'ai') {
            return null;
          }
          if (m.feedback.rating === rating) {
            return { ...m, feedback: { rating: null, reasons: [] } };
          }
          return {
            ...m,
            feedback: {
              rating,
              reasons: rating === 'like' ? [] : m.feedback.reasons,
            },
          };
        });
      },

      toggleReason(id, reason) {
        patch(id, m => {
          if (m.type !== 'ai' || m.feedback.rating !== 'dislike') {
            return null;
          }
          const has = m.feedback.reasons.includes(reason);
          const reasons = has
            ? m.feedback.reasons.filter(r => r !== reason)
            : [...m.feedback.reasons, reason];
          return { ...m, feedback: { ...m.feedback, reasons } };
        });
      },
    };
  });
}
