import type { RecommendationBase } from '../../../recommendations';
import type { AiMessage, Message, MessageType } from '../model/types';

/** Shape the backend sends: no timestamps, no client-only state. */
export interface RawMessage {
  id: string;
  type: MessageType;
  text: string;
  authorName?: string;
  recommendations?: RecommendationBase[];
}

export type Scenario = 'ok' | 'error' | 'empty';

/** What the store needs from the backend. Swap the mock for a real client here. */
export interface ConversationApi {
  fetchConversation(): Promise<Message[]>;
  sendMessage(text: string): Promise<void>;
  fetchAiReply(text: string): Promise<AiMessage>;
}
