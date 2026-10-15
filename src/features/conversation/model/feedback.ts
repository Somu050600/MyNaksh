import type { FeedbackReason } from './types';

export const FEEDBACK_REASONS: ReadonlyArray<{
  key: FeedbackReason;
  label: string;
}> = [
  { key: 'inaccurate', label: 'Inaccurate' },
  { key: 'too_generic', label: 'Too Generic' },
  { key: 'didnt_help', label: "Didn't Help" },
  { key: 'too_long', label: 'Too Long' },
];
