# AI Conversation Experience Implementation Plan

> **For agentic workers:** Execute task-by-task (inline). Steps use checkbox syntax. No commits unless the user asks (user instruction); `git init` only.

**Goal:** RN CLI + TS chat screen whose AI messages render extensible recommendation cards, plus production interactions (actions, feedback, composer, load states), previewable on web.

**Architecture:** `recommendations/` is a standalone registry-based module (DI via React context). `features/conversation/` owns model, normalized Zustand store (factory + singleton, API injected), and components. Message types also resolve through a registry. Dev-only Vite + react-native-web preview in `web/`.

**Tech Stack:** RN 0.88, React 19.3, TS strict, React Navigation native-stack, Reanimated 4 + worklets, Zustand 5, RNTL 13, Jest, Vite (web preview).

Spec: `docs/superpowers/specs/2026-10-16-ai-conversation-design.md`

---

## Shared contracts (defined once; all tasks use exactly these names)

```ts
// src/recommendations/core/types.ts
export interface RecommendationBase {
  id: string; type: string; title: string; subtitle?: string;
  meta?: Record<string, unknown>;
}
export interface RecommendationCardProps<T extends RecommendationBase = RecommendationBase> {
  item: T; onPress: (item: T) => void;
}
export interface RecommendationDefinition<T extends RecommendationBase = RecommendationBase> {
  type: T['type']; Card: React.ComponentType<RecommendationCardProps<T>>;
}
export function defineRecommendation<T extends RecommendationBase>(d: RecommendationDefinition<T>): RecommendationDefinition;
// src/recommendations/core/registry.ts
export interface RecommendationRegistry {
  register(def: RecommendationDefinition): void;
  resolve(type: string): RecommendationDefinition | undefined;
  has(type: string): boolean;
}
export function createRegistry(defs?: RecommendationDefinition[]): RecommendationRegistry;
// src/recommendations/core/RecommendationProvider.tsx
export function RecommendationProvider(p: { registry: RecommendationRegistry; onPress: (item: RecommendationBase) => void; children }): JSX.Element;
export function useRecommendationContext(): { registry; onPress };
// src/recommendations/core/RecommendationCarousel.tsx
export function RecommendationCarousel(p: { messageId: string; items: RecommendationBase[] }): JSX.Element | null; // null when empty
// src/recommendations/index.ts  -> exports all above + defaultRegistry + alertOnPress

// src/features/conversation/model/types.ts
export type MessageType = 'system' | 'user' | 'ai' | 'human';
export type SendStatus = 'sending' | 'sent' | 'failed';
export type Rating = 'like' | 'dislike';
export type FeedbackReason = 'inaccurate' | 'too_generic' | 'didnt_help' | 'too_long';
export interface Feedback { rating: Rating | null; reasons: FeedbackReason[] }
interface BaseMessage { id: string; text: string; createdAt: number; replyToId?: string }
export interface SystemMessage extends BaseMessage { type: 'system' }
export interface UserMessage extends BaseMessage { type: 'user'; status: SendStatus }
export interface AiMessage extends BaseMessage { type: 'ai'; recommendations: RecommendationBase[]; feedback: Feedback }
export interface HumanMessage extends BaseMessage { type: 'human'; authorName: string }
export type Message = SystemMessage | UserMessage | AiMessage | HumanMessage;
export type MessageAction = 'reply' | 'copy' | 'delete';
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

// model/buildTimeline.ts
export type GroupPos = 'single' | 'first' | 'middle' | 'last';
export type TimelineItem =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; id: string; groupPos: GroupPos };
export function buildTimeline(messages: Message[], opts?: { now?: number; groupWindowMs?: number }): TimelineItem[]; // chronological

// api/mockApi.ts
export type RawMessage = { id: string; type: MessageType; text: string; recommendations?: RecommendationBase[] };
export type Scenario = 'ok' | 'error' | 'empty';
export interface ConversationApi {
  fetchConversation(): Promise<Message[]>;          // normalized
  sendMessage(text: string): Promise<void>;          // rejects when text includes '/fail'
  fetchAiReply(text: string): Promise<AiMessage>;
}
export function createMockApi(opts?: { delayMs?: number; now?: () => number }): ConversationApi & { setScenario(s: Scenario): void; getScenario(): Scenario };
export function normalizeConversation(raw: RawMessage[], now: number): Message[];

// store/conversationStore.ts
export interface ConversationState {
  ids: string[]; byId: Record<string, Message>;
  loadStatus: LoadStatus; replyToId: string | null; aiTyping: boolean;
  load(): Promise<void>; send(text: string): Promise<void>; retry(id: string): Promise<void>;
  remove(id: string): void; setReply(id: string): void; clearReply(): void;
  setRating(id: string, rating: Rating): void; toggleReason(id: string, reason: FeedbackReason): void;
}
export function createConversationStore(api: ConversationApi): StoreApi<ConversationState>;
export const mockApi; export const useConversationStore;       // singleton bound to mockApi
export const selectMessages: (s: ConversationState) => Message[];
```

---

### Task 1: Tooling
**Files:** `package.json`, `babel.config.js`, `jest.config.js`, `jest.setup.js`, `tsconfig.json`
- [ ] Install `@testing-library/react-native@^13` (dev) and web preview deps (`react-native-web`, `react-dom@19.3.0`, `vite`, `@vitejs/plugin-react`).
- [ ] babel: add `react-native-worklets/plugin` (last). Jest: `setupFiles: ['./jest.setup.js']` with Reanimated `setUpTests` + clipboard mock; `transformIgnorePatterns` allow navigation/reanimated/worklets.
- [ ] `npx tsc --noEmit` and `npx jest` pass on the untouched template.

### Task 2: Recommendation core (TDD)
**Files:** `src/recommendations/core/{types,registry,RecommendationProvider,GenericCard,RecommendationCarousel}.ts(x)`, test `src/recommendations/core/__tests__/core.test.tsx`
Tests:
- `createRegistry([def]).resolve('x')` returns def; `resolve('unknown')` undefined; `register` after creation works; re-register same type overrides.
- Carousel renders one card per item using registered `Card`; unknown type renders `GenericCard` with title; empty `items` renders nothing; pressing a card calls provider `onPress` with the item; two messages with identical rec ids don't warn about duplicate keys (key = `messageId:id`).
Impl: horizontal `FlatList`, `snapToInterval`, `decelerationRate="fast"`, `showsHorizontalScrollIndicator={false}`, fixed card width constant exported as `CARD_WIDTH` + `getItemLayout`.

### Task 3: Built-in recommendation types (TDD)
**Files:** `src/recommendations/types/{gemstone,tarot,consultation,article,promotion}/{Card.tsx,index.ts}`, `types/index.ts` (`builtInDefinitions`), `src/recommendations/{defaultRegistry,alertOnPress,index}.ts`, shared `CardShell` in `core/CardShell.tsx`
Tests: `defaultRegistry` resolves all five; each Card renders title/subtitle and fires `onPress`; `alertOnPress` calls `Alert.alert(title, ...)` (spy).

### Task 4: Conversation model (TDD)
**Files:** `features/conversation/model/{types,buildTimeline}.ts`, `shared/utils/date.ts`, test `model/__tests__/buildTimeline.test.ts`
Tests (fixed `now`):
- Date separator inserted at first message and whenever the calendar day changes; labels `Today`, `Yesterday`, else `Mon, Oct 12`.
- Same sender within 5 min, same day → `first`/`middle`/`last`; lone message `single`; different sender or >5 min gap breaks group; `system` always `single`.
- Empty input → `[]`.
- Keys unique and stable (`date:YYYY-MM-DD`, `msg:<id>`).

### Task 5: Mock API + store (TDD)
**Files:** `features/conversation/api/{mockData,normalize,mockApi}.ts`, `store/conversationStore.ts`, tests `api/__tests__/normalize.test.ts`, `store/__tests__/store.test.ts` (fake timers, fake `ConversationApi`)
Tests:
- normalize: timestamps ascending, first two on prior day relative to `now`, AI gets `feedback {null, []}` and `recommendations` default `[]`, user gets `status: 'sent'`, human gets `authorName`.
- `load`: `loading`→`ready`; api reject → `error`; `empty` → ready with zero ids; load twice doesn't duplicate.
- `send`: optimistic message appears immediately with `status: 'sending'`, then `sent`; api reject → `failed`; `retry` flips to `sending` then `sent`; whitespace-only text ignored; consumes `replyToId` into the message and clears it.
- `remove`: removes from `ids` + `byId`, clears `replyToId` if it pointed to it; other ids keep order.
- `setRating`: like → like; same again → null; switching to like clears reasons. `toggleReason` adds/removes, only meaningful when rating is dislike; unknown/non-AI id is a no-op.
- AI reply: after a successful send, `aiTyping` true then false and an `ai` message appended.

### Task 6: Message components + list
**Files:** `features/conversation/components/{messageRegistry.ts,MessageRow.tsx,MessageList.tsx,DateSeparator.tsx}`, `components/bubbles/{Bubble,QuotedReply,UserBubble,AiBubble,HumanBubble,SystemEvent,SendStatusLabel,TypingIndicator}.tsx`, `shared/theme.ts`
- `messageRegistry: Record<MessageType, { Component; actions: MessageAction[] }>`; system `[]`, ai `['reply','copy','delete']`, human `['reply','copy','delete']`, user `['reply','copy','delete']`.
- `MessageRow` (memo, props `id`, `groupPos`, `onLongPress`) subscribes `byId[id]`.
- `MessageList`: inverted `FlatList` over `buildTimeline(...).reverse()`; `maintainVisibleContentPosition` off (inverted anchors bottom); scroll to offset 0 when message count grows and user is near bottom or last message is `user`; props tuned (`windowSize=11`, `initialNumToRender=12`, `removeClippedSubviews` on native).
- Tests (RNTL): renders text of each message type; date separator text present; system message has no long-press handler.

### Task 7: Part B UI + screen
**Files:** `components/{ActionSheet,ReplyPreview,FeedbackBar,Composer,StateViews}.tsx`, `shared/clipboard.ts`, `shared/ui/{Chip,PressableScale}.tsx`, `app/screens/ChatScreen.tsx`, `app/navigation/RootNavigator.tsx`, `App.tsx`, `components/DevMenu.tsx`
Tests (RNTL, singleton store reset in `beforeEach`):
- FeedbackBar: both buttons visible; tapping 👎 shows four chips; tapping a chip updates store `reasons`; tapping 👍 hides chips.
- ReplyPreview: shows quoted text; ✕ clears reply.
- ActionSheet: shows only allowed actions; Delete removes message from store; Reply sets `replyToId`; Copy calls clipboard.
- Composer: send disabled when empty; typing then send adds message in `sending` state, clears input; failed bubble shows Retry which re-sends.
- StateViews via ChatScreen: loading text while loading; `Unable to load conversation.` + Retry on error; `Start your conversation.` on empty.
- ChatScreen header has dev menu with scenario switches (ok/error/empty) that reload.

### Task 8: Web preview
**Files:** `web/{index.html,main.tsx,vite.config.ts}`, `src/shared/clipboard.web.ts`, `package.json` script `web`
- Vite alias `react-native`→`react-native-web`; `resolve.extensions` web-first; `define: { __DEV__: true }`; plugin-react with babel `react-native-worklets/plugin`; `optimizeDeps` for RN libs.
- Verify in built-in browser: full Part A + B walkthrough, console clean.

### Task 9: README + verification
**Files:** `README.md`, delete template `__tests__/App.test.tsx` content in favour of an App smoke test.
- README: structure, component architecture, state, recommendation strategy (how to add a type in 3 steps), performance, trade-offs, run instructions (web, native), demo script (incl. `/fail`, dev menu scenarios).
- `npx tsc --noEmit`, `npx jest`, `npx eslint .` all green (or failures reported verbatim).

## Self-review
- Spec coverage: timeline (T4,T6), registry (T2,T3), mock payload + extension (T5), actions/reply/delete (T5,T7), feedback (T5,T7), composer + statuses + retry (T5,T7), loading/empty/error (T7), README (T9), web verification (T8), optional AI reply (T5,T6 `TypingIndicator`).
- Names checked against the Shared contracts block above.
