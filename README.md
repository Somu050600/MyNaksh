# MyNaksh · AI Conversation Experience

A React Native (CLI) + TypeScript chat screen where an AI reply can carry **recommendations**
(gemstone, tarot, consultation, article, promotion, …) rendered as horizontally scrolling cards.
New recommendation types, and new message types, are added without touching the chat core.

**Stack:** React Native 0.88 (CLI) · TypeScript (strict) · React Navigation (native stack) ·
Reanimated 4 · Zustand · Jest + React Native Testing Library

## Status: what is and isn't verified

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `eslint .` | clean |
| Jest (78 tests, 9 suites) | passing |
| **iOS Simulator** (Xcode 26.6, iPhone 17, iOS 26.5, Debug build + Metro) | built and run; exercised: timeline and date separators, card tap → native alert, carousel swipe, 👎 chips, send → sent → typing → AI reply, `/fail` + Retry, long-press → Reply / Copy / Delete (clipboard verified; quote of a deleted message), error and empty states |
| iOS: not observed | the in-app "Loading conversation…" spinner (covered by a Jest test only) and keyboard avoidance (the simulator ran with a hardware keyboard, so the soft keyboard never appeared) |
| **Android** | not built or run |

## Run it

```bash
npm install

# Native (iOS needs Xcode plus its matching simulator platform: Xcode > Settings > Components)
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios        # or: npm run android

# Quality gates
npm test
npm run typecheck
npm run lint
```

### Demo script (≈3 min)

1. **Timeline.** Yesterday/Today separators, a system event, grouped bubbles, an AI message with four
   recommendation cards. Scroll the cards sideways; tap one for an alert.
2. **Feedback.** 👎 on the AI message expands chips; select a couple. 👍 collapses them.
3. **Send.** Type a message and tap send: *Sending…* → *Sent*, then a typing indicator and a mock AI reply.
   That reply includes `remedy` and `panchang` cards, which the app has **no definition for**: they render
   through the generic fallback card.
4. **Failure + Retry.** Send any message containing `/fail`: *Failed to send · Retry*. Retry succeeds.
5. **Long-press an AI message** → Reply (preview strip above the composer, quoted in the sent bubble),
   Copy, Delete. Delete the message you replied to: the quote becomes *Original message was deleted*.
6. **States.** ⚙︎ in the header → reload with *network failure*, *empty*, or *normal* to see
   *Unable to load conversation.* + Retry, *Start your conversation.*, and the loading state.

## Project structure

```
App.tsx                        providers: SafeArea, RecommendationProvider, navigation
src/
  app/
    navigation/RootNavigator   native stack, dev-menu header button
    screens/ChatScreen         composes list, composer, sheet, load/empty/error states
  shared/                      theme, Chip, BottomSheet, PressableScale, date utils, clipboard
  recommendations/             STANDALONE module (imports nothing from the chat feature)
    core/                      types, registry, Provider (DI), Carousel, CardShell, GenericCard
    types/<type>/              one folder per recommendation type: card + definition
    defaultRegistry.ts         registry of every built-in type
  features/conversation/
    api/                       ConversationApi contract, mock API, normalizer, mock data
    model/                     Message union, buildTimeline (pure), feedback reasons
    store/                     Zustand store factory + app singleton
    components/                MessageList, MessageRow, messageRegistry, bubbles/, Composer,
                               ReplyPreview, FeedbackBar, ActionSheet, StateViews, DevMenu
docs/superpowers/              design spec and implementation plan
```

## Component architecture

```
ChatScreen
├── StateViews            Loading / Empty / Error(Retry)
├── MessageList           inverted FlatList over buildTimeline(messages)
│   ├── DateSeparator
│   └── MessageRow(id, groupPos)       memo; subscribes to its own message
│       └── messageRegistry[type].Component
│           ├── SystemEvent
│           ├── UserBubble        + status footer (Sending… / Sent / Failed · Retry)
│           ├── HumanBubble
│           └── AiBubble          text + RecommendationCarousel + FeedbackBar
├── Composer              input + send, hosts ReplyPreview
└── ActionSheet           long-press menu, driven by the message type's allowed actions
```

Design choices worth calling out:

- **Message kinds are registry-driven too.** `messageRegistry` maps each `MessageType` to
  `{ Component, actions }`. It is typed as a mapped type over `MessageType`, so adding a message type
  without registering it is a compile error. System messages declare no actions, so they
  never open the long-press sheet.
- **Bubbles know nothing about the list.** Grouping arrives as a `groupPos` prop (`single | first |
  middle | last`) computed upstream; `BubbleFrame` only turns that into corner radii.
- **Cross-feature dependencies point one way:** `features/conversation` → `recommendations`, never back.

## State management

Zustand, as a **store factory** (`createConversationStore(api)`) plus one app singleton
(`store/instance.ts`). The factory takes the API as an argument, so tests inject a fake instead of mocking
modules, and swapping the mock for a real client is a one-line change.

State is normalized: `ids: string[]` (chronological) and `byId: Record<string, Message>`, plus
`loadStatus`, `replyToId`, `aiTyping`. One update touches one entry, and each row selects
`byId[id]`, so a 👎 tap re-renders one row instead of the list.

Behaviours encoded in the store (all covered by tests):

- **Send is optimistic:** the message is appended as `sending`, then becomes `sent` or `failed`. `retry`
  flips a failed message back to `sending` in place (no duplicate). After a successful send the mock AI replies.
- **Races are handled:** a stale `load` that resolves after a newer one is ignored; deleting a message
  while it is still sending does not resurrect it or trigger an AI reply.
- **Delete** removes from `ids` and `byId`, clears a pending reply that pointed at it, and leaves other
  messages in order. Bubbles quoting it show *Original message was deleted*.
- **Feedback:** like toggles, dislike reveals reasons, switching to like clears them; reasons only change
  while disliked; non-AI or unknown ids are no-ops.

## Recommendation rendering strategy

The goal: a new experience (say `panchang`) ships without changing `AiBubble`, the carousel, or the list.

```
backend payload ──► RecommendationBase { id, type: string, title, subtitle?, meta? }
                         │
        RecommendationCarousel (horizontal snap FlatList)
                         │  registry.resolve(item.type)
                ┌────────┴─────────┐
        registered definition    unknown type
        { type, Card }           GenericCard (built from base fields only)
```

- **Registry + provider.** `RecommendationProvider` injects the registry and the press handler through
  context. The app passes `alertOnPress` today; navigation tomorrow, with no card changes.
- **`type` is an open `string` on purpose.** The backend can ship a type this app version has never
  heard of; the carousel falls back to `GenericCard` instead of crashing or dropping it.
- **`defineRecommendation<T>({ type, Card })`** ties the card's `item` prop to one payload type
  (`GemstoneRecommendation` with a typed `meta`), then erases it so differently typed definitions share one
  registry. Typing is enforced where a type is authored, not where it is dispatched.
- **`CardShell`** is the shared frame (icon, eyebrow, title, subtitle, CTA), so new cards look consistent.

### Adding a recommendation type: 3 steps

```tsx
// 1. src/recommendations/types/remedy/index.tsx
export interface RemedyRecommendation extends RecommendationBase {
  type: 'remedy';
  meta?: { day?: string };
}
export function RemedyCard({ item, onPress }: RecommendationCardProps<RemedyRecommendation>) {
  return <CardShell icon="🪔" accent="#C2410C" eyebrow="Remedy" title={item.title}
    subtitle={item.subtitle} cta="Try it" onPress={() => onPress(item)} />;
}
export const remedyRecommendation = defineRecommendation<RemedyRecommendation>({
  type: 'remedy', Card: RemedyCard,
});

// 2. src/recommendations/types/index.ts: add `remedyRecommendation` to builtInRecommendations
// 3. done. No change to the carousel, bubbles, store or list.
```

## Performance considerations

- **Virtualized, bottom-anchored list.** Inverted `FlatList` with `initialNumToRender`, `windowSize`,
  `maxToRenderPerBatch`, stable `keyExtractor`, and `removeClippedSubviews` on Android only. Offset 0 is the
  bottom, so the latest message is visible on mount and delete/insert never yanks the viewport.
- **Auto-scroll rules.** Always follow the user's own send; follow incoming messages only when the
  user is within 120px of the bottom, so reading history is never interrupted.
- **Cheap re-renders.** `MessageRow` is `memo`'d and takes only primitives (`id`, `groupPos`) plus a stable
  callback; it subscribes to its own message by id. Timeline items are plain data from a pure function.
- **Carousel.** Fixed card width gives `getItemLayout` and exact `snapToInterval`; the registry lookup is
  a `Map` get per card.
- **Animations on the UI thread.** Press feedback, chip expansion and the typing dots use Reanimated
  (shared values + layout/entering animations), not JS-driven `Animated`.
- **Known soft spot:** `useMessages` re-derives when `byId` changes, so a feedback tap rebuilds the
  timeline (O(n)) and hands `FlatList` a new `data` array. Rows are protected by `memo`, so it is cheap
  at chat sizes, but the next step would be selecting a `(type, createdAt)` signature so the list ignores
  non-structural edits.

## Trade-offs (3-hour budget)

- **Native build status.** iOS Simulator only (see Status above); Android is untested.
- **Reanimated is mocked in Jest.** Tests prove behaviour and state, not animations.
- **No runtime payload validation.** `defineRecommendation` is a compile-time contract; a malformed
  `meta` from a real backend would reach the card. A schema (e.g. zod) at the API boundary is the fix.
- **Mock-driven realism.** Timestamps are synthesized in the normalizer (the brief's payload has none); AI
  replies are canned; `/fail` fails a message once so Retry can succeed.
- **Long-press scope.** The brief says AI messages; I enabled Reply/Copy/Delete for user and human
  messages too (a user needs to delete a failed send). System messages have none. It is one line per type in
  `messageRegistry`.
- **Delete is immediate**: no confirm, no undo, no server call.
- **Simple sheet.** `Modal` + Reanimated entering animation; no swipe-to-dismiss (would add
  `react-native-gesture-handler`).
- **Out of scope:** pagination of older history, a "jump to latest" button, unread markers, persistence,
  accessibility beyond roles/labels, dark mode, i18n.
