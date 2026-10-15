import { createMockApi } from '../mockApi';
import { normalizeConversation } from '../normalize';
import { MOCK_CONVERSATION } from '../mockData';

const NOW = new Date(2026, 9, 16, 12, 0).getTime();

describe('normalizeConversation', () => {
  const messages = normalizeConversation(MOCK_CONVERSATION, NOW);

  it('keeps ids and order, with ascending timestamps', () => {
    expect(messages.map(m => m.id)).toEqual(['1', '2', '3', '4']);
    const times = messages.map(m => m.createdAt);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('puts the first two messages on the previous day and the rest today', () => {
    const day = (ts: number) => new Date(ts).getDate();
    expect(messages.map(m => day(m.createdAt))).toEqual([15, 15, 16, 16]);
    expect(messages.every(m => m.createdAt <= NOW)).toBe(true);
  });

  it('adds defaults per message type', () => {
    const [system, user, ai, human] = messages;
    expect(system.type).toBe('system');
    expect(user).toMatchObject({ type: 'user', status: 'sent' });
    expect(ai).toMatchObject({
      type: 'ai',
      feedback: { rating: null, reasons: [] },
    });
    expect(ai.type === 'ai' && ai.recommendations).toHaveLength(4);
    expect(human).toMatchObject({
      type: 'human',
      authorName: expect.any(String),
    });
  });

  it('defaults recommendations to [] for an ai message without any', () => {
    const [m] = normalizeConversation(
      [{ id: 'x', type: 'ai', text: 'hi' }],
      NOW,
    );
    expect(m.type === 'ai' && m.recommendations).toEqual([]);
  });
});

describe('createMockApi', () => {
  const api = () => createMockApi({ delayMs: 0, now: () => NOW });

  it('returns the conversation for the ok scenario', async () => {
    await expect(api().fetchConversation()).resolves.toHaveLength(4);
  });

  it('rejects for the error scenario and returns [] for the empty scenario', async () => {
    const a = api();
    a.setScenario('error');
    await expect(a.fetchConversation()).rejects.toThrow(
      'Network request failed',
    );
    a.setScenario('empty');
    await expect(a.fetchConversation()).resolves.toEqual([]);
  });

  it('fails a "/fail" message once, then succeeds on retry', async () => {
    const a = api();
    await expect(a.sendMessage('hello /fail')).rejects.toThrow();
    await expect(a.sendMessage('hello /fail')).resolves.toBeUndefined();
    await expect(a.sendMessage('hello')).resolves.toBeUndefined();
  });

  it('returns ai replies with recommendations and unique ids', async () => {
    const a = api();
    const first = await a.fetchAiReply('hi');
    const second = await a.fetchAiReply('hi');
    expect(first.type).toBe('ai');
    expect(first.recommendations.length).toBeGreaterThan(0);
    expect(first.id).not.toBe(second.id);
  });
});
