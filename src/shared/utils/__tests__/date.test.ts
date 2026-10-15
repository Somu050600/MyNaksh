import { formatDateLabel, formatTime } from '../date';

const NOW = new Date(2026, 9, 16, 12, 0).getTime();

describe('date utils', () => {
  it('labels today, yesterday and older days', () => {
    expect(formatDateLabel(new Date(2026, 9, 16, 0, 5).getTime(), NOW)).toBe(
      'Today',
    );
    expect(formatDateLabel(new Date(2026, 9, 15, 23, 59).getTime(), NOW)).toBe(
      'Yesterday',
    );
    expect(formatDateLabel(new Date(2026, 9, 12, 8, 0).getTime(), NOW)).toBe(
      'Mon, Oct 12',
    );
  });

  it('formats 12-hour time', () => {
    expect(formatTime(new Date(2026, 9, 16, 0, 5).getTime())).toBe('12:05 AM');
    expect(formatTime(new Date(2026, 9, 16, 13, 30).getTime())).toBe('1:30 PM');
    expect(formatTime(new Date(2026, 9, 16, 12, 0).getTime())).toBe('12:00 PM');
  });
});
