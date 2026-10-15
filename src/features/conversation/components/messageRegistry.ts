import type { ComponentType } from 'react';
import type { GroupPos } from '../model/buildTimeline';
import type { Message, MessageAction, MessageType } from '../model/types';
import { AiBubble } from './bubbles/AiBubble';
import { HumanBubble } from './bubbles/HumanBubble';
import { SystemEvent } from './bubbles/SystemEvent';
import type { BubbleProps } from './bubbles/types';
import { UserBubble } from './bubbles/UserBubble';

interface MessageDefinition<K extends MessageType> {
  Component: ComponentType<BubbleProps<K>>;
  /** What the long-press sheet offers for this kind of message. */
  actions: MessageAction[];
}

const ALL_ACTIONS: MessageAction[] = ['reply', 'copy', 'delete'];

/**
 * Message kinds are data, like recommendations: add a type to `Message`, add an
 * entry here, and the list, long-press sheet and grouping pick it up.
 * The mapped type makes a missing entry a compile error.
 */
export const messageRegistry: { [K in MessageType]: MessageDefinition<K> } = {
  system: { Component: SystemEvent, actions: [] },
  user: { Component: UserBubble, actions: ALL_ACTIONS },
  ai: { Component: AiBubble, actions: ALL_ACTIONS },
  human: { Component: HumanBubble, actions: ALL_ACTIONS },
};

interface ResolvedDefinition {
  Component: ComponentType<{ message: Message; groupPos: GroupPos }>;
  actions: MessageAction[];
}

/** Dispatch on the runtime `type`; the registry's mapped type guarantees the pairing. */
export function getMessageDefinition(message: Message): ResolvedDefinition {
  return messageRegistry[message.type] as unknown as ResolvedDefinition;
}

export function getAllowedActions(message: Message): MessageAction[] {
  return getMessageDefinition(message).actions;
}
