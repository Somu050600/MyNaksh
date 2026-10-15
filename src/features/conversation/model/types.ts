import type { RecommendationBase } from '../../../recommendations';

export type MessageType = 'system' | 'user' | 'ai' | 'human';
export type SendStatus = 'sending' | 'sent' | 'failed';
export type Rating = 'like' | 'dislike';
export type FeedbackReason =
  | 'inaccurate'
  | 'too_generic'
  | 'didnt_help'
  | 'too_long';
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type MessageAction = 'reply' | 'copy' | 'delete';

export interface Feedback {
  rating: Rating | null;
  reasons: FeedbackReason[];
}

interface BaseMessage {
  id: string;
  text: string;
  /** Epoch ms. */
  createdAt: number;
  replyToId?: string;
}

export interface SystemMessage extends BaseMessage {
  type: 'system';
}

export interface UserMessage extends BaseMessage {
  type: 'user';
  status: SendStatus;
}

export interface AiMessage extends BaseMessage {
  type: 'ai';
  recommendations: RecommendationBase[];
  feedback: Feedback;
}

export interface HumanMessage extends BaseMessage {
  type: 'human';
  authorName: string;
}

export type Message = SystemMessage | UserMessage | AiMessage | HumanMessage;
