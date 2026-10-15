import type { Message } from './types';

export function senderName(message: Message): string {
  switch (message.type) {
    case 'user':
      return 'You';
    case 'ai':
      return 'AI Astrologer';
    case 'human':
      return message.authorName;
    default:
      return 'System';
  }
}
