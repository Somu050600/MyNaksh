# AI Conversation Experience — Design

> **Revision:** the dev-only `react-native-web` preview described in this document was later removed; verification moved to the iOS Simulator.

Date: 2026-10-16 · Status: approved by user ("go ahead")

## Goal

React Native (CLI) + TypeScript chat screen where AI messages can carry zero or more
**recommendations** (gemstone, tarot, consultation, article, promotion, …) rendered as
horizontal cards. New recommendation types and new message types must be addable without
touching core code. Part B adds production interactions (actions, feedback, composer,
load/empty/error states).

## Constraints / decisions

- No Xcode / Android SDK on the dev machine, and user will not install Xcode. Verification:
  strict `tsc`, Jest + React Native Testing Library, and a **dev-only `react-native-web`
  preview** driven in the built-in browser. Web is a preview target, not a shipped target.
- Stack: RN 0.88 (CLI), TypeScript strict, React Navigation native stack, Reanimated 4
  (+ `react-native-worklets`), Zustand, clipboard behind a thin `shared/clipboard` seam
  (so web/native differ in one file).
- Project root is `MyNaksh/` itself. `git init` locally; nothing committed or pushed unless asked.

## Recommendation framework (core of the assignment)

Approaches considered: (A) `switch(type)` in component — rejected, edits core per type;
(B) **registry of self-contained type modules + generic fallback** — chosen;
(C) pure server-driven UI — rejected, loses bespoke cards, but B's fallback card keeps its
graceful-degradation benefit.

- `RecommendationBase { id; type: string; title; subtitle?; meta? }`.
- `defineRecommendation<T>({ type, Card, onPress? })` keeps payload type and card props linked.
- `registry.register(def)` / `registry.resolve(type)`; unknown type → `GenericCard`.
- `<RecommendationCarousel items messageId />`: horizontal snap `FlatList`; key =
  `${messageId}:${id}` (ids repeat across messages in the mock payload).
- Presses go through an injectable `onRecommendationPress` (default `Alert`), swappable
  for navigation later.
- Each type lives in `recommendations/types/<name>/` (card + definition). Adding a type =
  new folder + one line in `types/index.ts`.
- `recommendations/` imports nothing from `features/conversation` (standalone module).

## Message model

`Message = SystemMessage | UserMessage | AiMessage | HumanMessage`, base
`{ id, type, text, createdAt, replyToId? }`.
- `UserMessage.status: 'sending' | 'sent' | 'failed'`
- `AiMessage.recommendations?: Recommendation[]`, `feedback: { rating: 'like'|'dislike'|null; reasons: FeedbackReason[] }`
- Mock payload has no timestamps → a normalizer at the API boundary adds `createdAt`
  (spread over two days so date separators show) and defaults.
- Message-type registry (`type → { Component, actions: ('reply'|'copy'|'delete')[] }`)
  mirrors the recommendation registry; system messages expose no actions.

## State (Zustand)

Normalized: `byId`, `ids`, `loadStatus: idle|loading|ready|error`, `replyToId`.
Actions: `load`, `send`, `retry`, `remove`, `setReply`, `clearReply`, `setRating`,
`toggleReason`. Mock API (`api/mockApi.ts`) owns delay + scenarios
(`ok | error | empty`), switchable from a dev menu in the header. Send fails when text
contains `/fail` (deterministic demo). Optional extra: after a send succeeds, a mock AI
replies (typing indicator + recommendations).
Rows subscribe by id and are `React.memo`'d so a feedback tap re-renders one row.

## Timeline

`buildTimeline(ids, byId)` — pure, tested — yields `DateSeparator | MessageItem{groupPos}`;
groups consecutive same-sender messages within 5 min (`single|first|middle|last`).
Inverted `FlatList`: bottom-anchored (auto-scroll to latest, delete keeps position),
`windowSize`/`removeClippedSubviews`/memoized rows for performance. Scroll-to-latest on
own send, and on incoming when already near bottom.

## Part B

- Long-press → Reanimated `ActionSheet` (Reply / Copy / Delete) driven by the type's allowed actions.
- Reply → `ReplyPreview` above composer; sent bubble shows quoted snippet.
- Feedback → `FeedbackBar` (👍/👎); 👎 expands multi-select chips (Inaccurate, Too Generic,
  Didn't Help, Too Long), animated with Reanimated layout transition.
- Send → optimistic `sending` → `sent` (~1.2s) or `failed` + Retry.
- States → `LoadingView` ("Loading conversation..."), `EmptyView` ("Start your
  conversation."), `ErrorView` ("Unable to load conversation." + Retry).

## Layout

```
src/
  app/                       App.tsx, navigation/
  shared/                    theme, ui/ (Chip, PressableScale), utils/date, clipboard
  recommendations/
    core/                    types, registry, RecommendationCarousel, GenericCard
    types/{gemstone,tarot,consultation,article,promotion}/
  features/conversation/
    api/                     mockApi, mockData, normalize
    model/                   types, buildTimeline
    store/                   conversationStore
    components/              MessageList, MessageRow, messageRegistry, bubbles,
                             Composer, ReplyPreview, FeedbackBar, ActionSheet, StateViews
web/                         dev-only Vite preview (index.html, vite.config.ts, entry)
```

## Testing

Jest (+ RNTL): `buildTimeline`, store actions (send/retry/delete/feedback/reply),
registry resolve + fallback, carousel and feedback component behavior. Strict `tsc`.
Web preview exercised in the built-in browser for the full Part A + B walkthrough.

## Deliverables

Repo, README (structure, component architecture, state, recommendation strategy,
performance, trade-offs, web preview + demo script). Screen recording is the user's
(web preview makes it possible without Xcode).

## Out of scope

Real backend, persistence, push, pixel polish, Android/iOS native builds on this machine.
