const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad = (n: number) => String(n).padStart(2, '0');

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Local calendar day, e.g. 2026-10-16. Stable key for grouping and separators. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "Today", "Yesterday", otherwise "Mon, Oct 12". Avoids Intl (uneven on Hermes). */
export function formatDateLabel(ts: number, now: number): string {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(ts)) / DAY_MS);
  if (daysAgo === 0) {
    return 'Today';
  }
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  const d = new Date(ts);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hours = d.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${pad(d.getMinutes())} ${suffix}`;
}
