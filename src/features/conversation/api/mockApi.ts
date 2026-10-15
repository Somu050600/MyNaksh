import type { AiMessage } from '../model/types';
import { MOCK_AI_REPLIES, MOCK_CONVERSATION } from './mockData';
import { normalizeConversation } from './normalize';
import type { ConversationApi, Scenario } from './types';

interface MockApiOptions {
  /** Forces every simulated call to this latency (tests pass 0). */
  delayMs?: number;
  now?: () => number;
}

export type MockApi = ConversationApi & {
  setScenario(scenario: Scenario): void;
  getScenario(): Scenario;
};

export function createMockApi({
  delayMs,
  now = Date.now,
}: MockApiOptions = {}): MockApi {
  let scenario: Scenario = 'ok';
  let replyCursor = 0;
  let replyId = 0;
  const failedOnce = new Set<string>();

  const wait = (defaultMs: number) =>
    new Promise<void>(resolve => setTimeout(resolve, delayMs ?? defaultMs));

  return {
    setScenario: next => {
      scenario = next;
    },
    getScenario: () => scenario,

    async fetchConversation() {
      await wait(900);
      if (scenario === 'error') {
        throw new Error('Network request failed');
      }
      return scenario === 'empty'
        ? []
        : normalizeConversation(MOCK_CONVERSATION, now());
    },

    async sendMessage(text) {
      await wait(1200);
      // Demo hook: a message containing "/fail" fails once, so Retry then succeeds.
      if (text.includes('/fail') && !failedOnce.has(text)) {
        failedOnce.add(text);
        throw new Error('Failed to send message');
      }
    },

    async fetchAiReply() {
      await wait(1400);
      const reply = MOCK_AI_REPLIES[replyCursor++ % MOCK_AI_REPLIES.length];
      const message: AiMessage = {
        id: `ai-${++replyId}-${now()}`,
        type: 'ai',
        text: reply.text,
        createdAt: now(),
        recommendations: reply.recommendations ?? [],
        feedback: { rating: null, reasons: [] },
      };
      return message;
    },
  };
}
