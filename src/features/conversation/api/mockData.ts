import type { RawMessage } from './types';

/** Initial conversation payload from the assignment brief. */
export const MOCK_CONVERSATION: RawMessage[] = [
  {
    id: '1',
    type: 'system',
    text: 'Your session with AI Astrologer has started.',
  },
  {
    id: '2',
    type: 'user',
    text: 'Can you tell me about my career this year?',
  },
  {
    id: '3',
    type: 'ai',
    text: 'I can already see a strong Saturn influence in your chart. Based on this, here are a few recommendations that may help you.',
    recommendations: [
      {
        id: '1',
        type: 'gemstone',
        title: 'Blue Sapphire',
        subtitle: 'Recommended for Saturn',
      },
      { id: '2', type: 'tarot', title: 'Career Tarot Reading' },
      { id: '3', type: 'consultation', title: 'Talk to an Astrologer' },
      { id: '4', type: 'article', title: 'Understanding Saturn Mahadasha' },
    ],
  },
  {
    id: '4',
    type: 'human',
    text: 'I also recommend focusing on your upcoming Jupiter transit.',
  },
];

/**
 * Canned AI replies. `remedy` and `panchang` are deliberately not registered in
 * the app, so they exercise the generic-card fallback for unknown types.
 */
export const MOCK_AI_REPLIES: Array<
  Pick<RawMessage, 'text' | 'recommendations'>
> = [
  {
    text: 'Jupiter is moving into a supportive position for you. A few things that may help:',
    recommendations: [
      {
        id: '1',
        type: 'remedy',
        title: 'Thursday Jupiter Remedy',
        subtitle: 'Chant and donate yellow items',
      },
      { id: '2', type: 'panchang', title: "Today's Panchang" },
      {
        id: '3',
        type: 'promotion',
        title: '20% off your first consultation',
        subtitle: 'Use code NAKSH20',
      },
    ],
  },
  {
    text: 'Good question. Here is some reading that goes deeper.',
    recommendations: [
      { id: '1', type: 'article', title: 'Reading your 10th house' },
      { id: '2', type: 'tarot', title: 'Love and Relationships Tarot' },
    ],
  },
  {
    text: 'I hear you. Take a moment, then consider speaking with a human astrologer.',
    recommendations: [
      {
        id: '1',
        type: 'consultation',
        title: 'Talk to an Astrologer',
        subtitle: 'Next slot in 15 min',
      },
    ],
  },
];
