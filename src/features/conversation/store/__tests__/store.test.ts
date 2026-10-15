import type { ConversationApi } from '../../api/types';
import type { AiMessage, Message } from '../../model/types';
import { createConversationStore } from '../conversationStore';

const T0 = new Date(2026, 9, 16, 12, 0).getTime();

const aiMessage = (id: string): AiMessage => ({
  id,
  type: 'ai',
  text: `ai ${id}`,
  createdAt: T0,
  recommendations: [{ id: '1', type: 'tarot', title: 'Tarot' }],
  feedback: { rating: null, reasons: [] },
});

const seed = (): Message[] => [
  { id: 's1', type: 'system', text: 'started', createdAt: T0 - 4000 },
  {
    id: 'u1',
    type: 'user',
    text: 'hello',
    createdAt: T0 - 3000,
    status: 'sent',
  },
  aiMessage('a1'),
  {
    id: 'h1',
    type: 'human',
    text: 'hi there',
    createdAt: T0 - 1000,
    authorName: 'Meera',
  },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(overrides: Partial<ConversationApi> = {}) {
  const api: jest.Mocked<ConversationApi> = {
    fetchConversation: jest.fn().mockResolvedValue(seed()),
    sendMessage: jest.fn().mockResolvedValue(undefined),
    fetchAiReply: jest.fn().mockResolvedValue(aiMessage('reply-1')),
    ...overrides,
  } as jest.Mocked<ConversationApi>;
  let n = 0;
  const store = createConversationStore(api, {
    now: () => T0 + n,
    createId: () => `local-${++n}`,
  });
  return { api, store, get: store.getState };
}

const ordered = (
  s: ReturnType<ReturnType<typeof setup>['store']['getState']>,
) => s.ids.map(id => s.byId[id]);

describe('load', () => {
  it('goes idle -> loading -> ready and stores messages in order', async () => {
    const { store, get } = setup();
    expect(get().loadStatus).toBe('idle');
    const p = get().load();
    expect(get().loadStatus).toBe('loading');
    await p;
    expect(get().loadStatus).toBe('ready');
    expect(get().ids).toEqual(['s1', 'u1', 'a1', 'h1']);
    expect(store.getState().byId.a1.type).toBe('ai');
  });

  it('goes to error when the api rejects, and can retry', async () => {
    const fetchConversation = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(seed());
    const { get } = setup({ fetchConversation });
    await get().load();
    expect(get().loadStatus).toBe('error');
    await get().load();
    expect(get().loadStatus).toBe('ready');
    expect(get().ids).toHaveLength(4);
  });

  it('is ready with no ids for an empty conversation', async () => {
    const { get } = setup({
      fetchConversation: jest.fn().mockResolvedValue([]),
    });
    await get().load();
    expect(get().loadStatus).toBe('ready');
    expect(get().ids).toEqual([]);
  });

  it('replaces rather than duplicates when loaded twice', async () => {
    const { get } = setup();
    await get().load();
    await get().load();
    expect(get().ids).toEqual(['s1', 'u1', 'a1', 'h1']);
  });

  it('ignores a stale load that finishes after a newer one', async () => {
    const slow = deferred<Message[]>();
    const fetchConversation = jest
      .fn()
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValueOnce([]);
    const { get } = setup({ fetchConversation });
    const first = get().load();
    await get().load();
    slow.resolve(seed());
    await first;
    expect(get().ids).toEqual([]);
    expect(get().loadStatus).toBe('ready');
  });
});

describe('send / retry', () => {
  it('adds the message optimistically as sending, then marks it sent', async () => {
    const d = deferred<void>();
    const { get, api } = setup({
      sendMessage: jest.fn().mockReturnValue(d.promise),
    });
    await get().load();

    const p = get().send('  my question  ');
    const last = ordered(get()).at(-1)!;
    expect(last).toMatchObject({
      type: 'user',
      text: 'my question',
      status: 'sending',
    });

    d.resolve();
    await p;
    expect(get().byId[last.id]).toMatchObject({ status: 'sent' });
    expect(api.sendMessage).toHaveBeenCalledWith('my question');
  });

  it('appends the ai reply after a successful send, toggling aiTyping', async () => {
    const reply = deferred<AiMessage>();
    const { get } = setup({
      fetchAiReply: jest.fn().mockReturnValue(reply.promise),
    });
    await get().load();

    const p = get().send('hi');
    await Promise.resolve();
    await Promise.resolve();
    expect(get().aiTyping).toBe(true);
    reply.resolve(aiMessage('reply-1'));
    await p;
    expect(get().aiTyping).toBe(false);
    expect(get().ids.at(-1)).toBe('reply-1');
  });

  it('marks the message failed and skips the ai reply when sending rejects', async () => {
    const { get, api } = setup({
      sendMessage: jest.fn().mockRejectedValue(new Error('x')),
    });
    await get().load();
    await get().send('hi');
    const last = ordered(get()).at(-1)!;
    expect(last).toMatchObject({ type: 'user', status: 'failed' });
    expect(api.fetchAiReply).not.toHaveBeenCalled();
    expect(get().aiTyping).toBe(false);
  });

  it('retry re-sends a failed message in place', async () => {
    const sendMessage = jest
      .fn()
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValue(undefined);
    const { get } = setup({ sendMessage });
    await get().load();
    await get().send('hi');
    const failed = ordered(get()).at(-1)!;
    const countBefore = get().ids.length;

    const p = get().retry(failed.id);
    expect(get().byId[failed.id]).toMatchObject({ status: 'sending' });
    await p;
    expect(get().byId[failed.id]).toMatchObject({ status: 'sent' });
    expect(get().ids.filter(id => id === failed.id)).toHaveLength(1);
    expect(get().ids.length).toBeGreaterThanOrEqual(countBefore);
  });

  it('ignores blank text and retry of a message that did not fail', async () => {
    const { get, api } = setup();
    await get().load();
    await get().send('   ');
    expect(get().ids).toHaveLength(4);
    await get().retry('u1');
    expect(api.sendMessage).not.toHaveBeenCalled();
  });

  it('attaches the pending reply to the sent message and clears it', async () => {
    const { get } = setup();
    await get().load();
    get().setReply('a1');
    const p = get().send('thanks');
    expect(get().replyToId).toBeNull();
    const sent = ordered(get()).at(-1)!;
    expect(sent.replyToId).toBe('a1');
    await p;
  });

  it('does not resurrect a message deleted while it was sending', async () => {
    const d = deferred<void>();
    const { get } = setup({
      sendMessage: jest.fn().mockReturnValue(d.promise),
    });
    await get().load();
    const p = get().send('hi');
    const id = ordered(get()).at(-1)!.id;
    get().remove(id);
    d.resolve();
    await p;
    expect(get().byId[id]).toBeUndefined();
    expect(get().ids).not.toContain(id);
  });
});

describe('remove / reply', () => {
  it('removes a message and keeps the order of the others', async () => {
    const { get } = setup();
    await get().load();
    get().remove('a1');
    expect(get().ids).toEqual(['s1', 'u1', 'h1']);
    expect(get().byId.a1).toBeUndefined();
  });

  it('clears the pending reply if its target is removed', async () => {
    const { get } = setup();
    await get().load();
    get().setReply('a1');
    expect(get().replyToId).toBe('a1');
    get().remove('a1');
    expect(get().replyToId).toBeNull();
  });

  it('ignores replying to a missing message, and clearReply resets', async () => {
    const { get } = setup();
    await get().load();
    get().setReply('nope');
    expect(get().replyToId).toBeNull();
    get().setReply('h1');
    get().clearReply();
    expect(get().replyToId).toBeNull();
  });
});

describe('feedback', () => {
  const feedbackOf = (
    s: ReturnType<ReturnType<typeof setup>['store']['getState']>,
  ) => {
    const m = s.byId.a1;
    return m.type === 'ai' ? m.feedback : null;
  };

  it('sets, toggles off and switches rating', async () => {
    const { get } = setup();
    await get().load();
    get().setRating('a1', 'like');
    expect(feedbackOf(get())).toEqual({ rating: 'like', reasons: [] });
    get().setRating('a1', 'like');
    expect(feedbackOf(get())).toEqual({ rating: null, reasons: [] });
    get().setRating('a1', 'dislike');
    expect(feedbackOf(get())?.rating).toBe('dislike');
  });

  it('toggles reasons only while disliked, and clears them when switching to like', async () => {
    const { get } = setup();
    await get().load();
    get().toggleReason('a1', 'too_long');
    expect(feedbackOf(get())?.reasons).toEqual([]);

    get().setRating('a1', 'dislike');
    get().toggleReason('a1', 'too_long');
    get().toggleReason('a1', 'inaccurate');
    expect(feedbackOf(get())?.reasons).toEqual(['too_long', 'inaccurate']);
    get().toggleReason('a1', 'too_long');
    expect(feedbackOf(get())?.reasons).toEqual(['inaccurate']);

    get().setRating('a1', 'like');
    expect(feedbackOf(get())).toEqual({ rating: 'like', reasons: [] });
  });

  it('ignores feedback on non-ai or unknown messages', async () => {
    const { get } = setup();
    await get().load();
    const before = get().byId;
    get().setRating('u1', 'like');
    get().setRating('nope', 'like');
    get().toggleReason('h1', 'too_long');
    expect(get().byId).toBe(before);
  });
});
