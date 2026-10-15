import type { GroupPos } from '../../model/buildTimeline';
import type { Message, MessageType } from '../../model/types';

export type MessageOf<K extends MessageType> = Extract<Message, { type: K }>;

export interface BubbleProps<K extends MessageType> {
  message: MessageOf<K>;
  groupPos: GroupPos;
}
