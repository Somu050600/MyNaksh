import { buildTimeline } from '../buildTimeline';
import type { Message, MessageType } from '../types';

const NOW = new Date(2026, 9, 16, 12, 0).getTime();
const at = (day: number, h: number, m = 0) =>
  new Date(2026, 9, day, h, m).getTime();

function msg(id: string, type: MessageType, createdAt: number): Message {
  const base = { id, text: id, createdAt };
  switch (type) {
    case 'user':
      return { ...base, type, status: 'sent' };
    case 'ai':
      return {
        ...base,
        type,
        recommendations: [],
        feedback: { rating: null, reasons: [] },
      };
    case 'human':
      return { ...base, type, authorName: 'Astro' };
    default:
      return { ...base, type };
  }
}

describe('buildTimeline', () => {
  it('returns [] for no messages', () => {
    expect(buildTimeline([], { now: NOW })).toEqual([]);
  });

  it('adds a date separator at the start and when the day changes', () => {
    const items = buildTimeline(
      [
        msg('a', 'user', at(14, 9)),
        msg('b', 'ai', at(15, 9)),
        msg('c', 'user', at(16, 9)),
      ],
      { now: NOW },
    );
    const labels = items
      .filter(i => i.kind === 'date')
      .map(i => (i as { label: string }).label);
    expect(labels).toEqual(['Wed, Oct 14', 'Yesterday', 'Today']);
    expect(items.map(i => i.kind)).toEqual([
      'date',
      'message',
      'date',
      'message',
      'date',
      'message',
    ]);
  });

  it('groups consecutive same-sender messages within the window', () => {
    const items = buildTimeline(
      [
        msg('a', 'user', at(16, 9, 0)),
        msg('b', 'user', at(16, 9, 1)),
        msg('c', 'user', at(16, 9, 2)),
      ],
      { now: NOW },
    );
    const pos = items
      .filter(i => i.kind === 'message')
      .map(i => (i as { groupPos: string }).groupPos);
    expect(pos).toEqual(['first', 'middle', 'last']);
  });

  it('breaks a group on sender change or when the gap exceeds the window', () => {
    const items = buildTimeline(
      [
        msg('a', 'user', at(16, 9, 0)),
        msg('b', 'ai', at(16, 9, 1)),
        msg('c', 'ai', at(16, 9, 30)),
      ],
      { now: NOW },
    );
    const pos = items
      .filter(i => i.kind === 'message')
      .map(i => (i as { groupPos: string }).groupPos);
    expect(pos).toEqual(['single', 'single', 'single']);
  });

  it('never groups system messages', () => {
    const items = buildTimeline(
      [msg('a', 'system', at(16, 9, 0)), msg('b', 'system', at(16, 9, 1))],
      { now: NOW },
    );
    const pos = items
      .filter(i => i.kind === 'message')
      .map(i => (i as { groupPos: string }).groupPos);
    expect(pos).toEqual(['single', 'single']);
  });

  it('does not group across midnight even inside the window', () => {
    const items = buildTimeline(
      [
        msg('a', 'user', new Date(2026, 9, 15, 23, 58).getTime()),
        msg('b', 'user', new Date(2026, 9, 16, 0, 1).getTime()),
      ],
      { now: NOW },
    );
    const pos = items
      .filter(i => i.kind === 'message')
      .map(i => (i as { groupPos: string }).groupPos);
    expect(pos).toEqual(['single', 'single']);
  });

  it('produces unique, stable keys', () => {
    const messages = [msg('a', 'user', at(15, 9)), msg('b', 'ai', at(16, 9))];
    const keys = buildTimeline(messages, { now: NOW }).map(i => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual([
      'date:2026-10-15',
      'msg:a',
      'date:2026-10-16',
      'msg:b',
    ]);
  });
});
