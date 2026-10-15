import { startOfDay } from '../../../shared/utils/date';
import type { Message } from '../model/types';
import type { RawMessage } from './types';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Backend payload -> client model. Adds what the wire format lacks:
 * timestamps (all but the last two messages land yesterday, so date
 * separators show up), send status, feedback and recommendation defaults.
 */
export function normalizeConversation(
  raw: RawMessage[],
  now: number,
): Message[] {
  const yesterdayEvening = startOfDay(now) - 3 * HOUR;
  const todayCount = Math.min(2, raw.length);
  const firstTodayIndex = raw.length - todayCount;

  return raw.map((r, index) => {
    const createdAt =
      index < firstTodayIndex
        ? yesterdayEvening + index * 2 * MINUTE
        : now - (raw.length - index) * MINUTE;
    const base = { id: r.id, text: r.text, createdAt };

    switch (r.type) {
      case 'user':
        return { ...base, type: 'user', status: 'sent' };
      case 'ai':
        return {
          ...base,
          type: 'ai',
          recommendations: r.recommendations ?? [],
          feedback: { rating: null, reasons: [] },
        };
      case 'human':
        return {
          ...base,
          type: 'human',
          authorName: r.authorName ?? 'Astrologer Meera',
        };
      default:
        return { ...base, type: 'system' };
    }
  });
}
