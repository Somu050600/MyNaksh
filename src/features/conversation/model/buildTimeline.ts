import { dayKey, formatDateLabel } from '../../../shared/utils/date';
import type { Message } from './types';

export type GroupPos = 'single' | 'first' | 'middle' | 'last';

export type TimelineItem =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; id: string; groupPos: GroupPos };

interface Options {
  now?: number;
  groupWindowMs?: number;
}

const DEFAULT_GROUP_WINDOW_MS = 5 * 60 * 1000;

/**
 * Turns messages (chronological) into list items: date separators plus
 * messages annotated with their position inside a run from the same sender.
 * Pure, so it is cheap to test and safe to memoize.
 */
export function buildTimeline(
  messages: Message[],
  { now = Date.now(), groupWindowMs = DEFAULT_GROUP_WINDOW_MS }: Options = {},
): TimelineItem[] {
  const canGroup = (a: Message, b: Message) =>
    a.type === b.type &&
    a.type !== 'system' &&
    dayKey(a.createdAt) === dayKey(b.createdAt) &&
    b.createdAt - a.createdAt <= groupWindowMs;

  const items: TimelineItem[] = [];

  messages.forEach((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];

    if (!prev || dayKey(prev.createdAt) !== dayKey(message.createdAt)) {
      items.push({
        kind: 'date',
        key: `date:${dayKey(message.createdAt)}`,
        label: formatDateLabel(message.createdAt, now),
      });
    }

    const joinsPrev = !!prev && canGroup(prev, message);
    const joinsNext = !!next && canGroup(message, next);
    const groupPos: GroupPos = joinsPrev
      ? joinsNext
        ? 'middle'
        : 'last'
      : joinsNext
      ? 'first'
      : 'single';

    items.push({
      kind: 'message',
      key: `msg:${message.id}`,
      id: message.id,
      groupPos,
    });
  });

  return items;
}
