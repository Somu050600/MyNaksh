# MyNaksh: AI Conversation Experience

React Native (CLI) + TypeScript chat screen where AI replies carry recommendation cards (tarot, gemstone,
consultation, article, promotion). Adding a new recommendation type is one folder and one line; the chat
code doesn't change.

**Stack:** React Native 0.88, TypeScript (strict), React Navigation, Reanimated 4, Zustand, Jest + RNTL.

## Run

```bash
npm install
cd ios && pod install && cd ..
npm run ios          # or npm run android
npm test && npm run typecheck && npm run lint
```

Everything is mocked. Send a message containing `/fail` to see Failed + Retry (it succeeds on retry). The
gear icon in the header reloads the chat as normal, empty or network-failure.

## Tested

- `tsc` and `eslint` clean, 78 Jest tests passing.
- Ran every flow on the iOS Simulator (iPhone 17, iOS 26.5).
- **Not tested:** Android, and keyboard avoidance (simulator used a hardware keyboard).

## Project structure

```
src/
  app/                       navigation + ChatScreen
  shared/                    theme, Chip, BottomSheet, PressableScale, date utils, clipboard
  recommendations/           standalone module, no imports from the chat feature
    core/                    types, registry, provider, carousel, CardShell, GenericCard
    types/<type>/            one folder per type: card + definition
  features/conversation/
    api/                     mock API, normalizer, mock data
    model/                   Message union, buildTimeline (pure)
    store/                   Zustand store
    components/              list, rows, bubbles, composer, reply preview, feedback, action sheet
```

## Component architecture

`ChatScreen` → `MessageList` (inverted FlatList over `buildTimeline`) → `MessageRow` →
`messageRegistry[type]` → `SystemEvent | UserBubble | HumanBubble | AiBubble`. `AiBubble` renders text,
`RecommendationCarousel` and `FeedbackBar`. `Composer` hosts `ReplyPreview`; `ActionSheet` handles long-press.

- Message types use a registry too (`{ Component, actions }`). It's a mapped type, so a new message type
  that isn't registered fails to compile.
- Bubbles only receive a `groupPos` prop (`single | first | middle | last`); grouping is computed upstream.

## State management

Zustand store factory, `createConversationStore(api)`, plus one app-wide instance. Injecting the API keeps
tests simple and makes swapping in a real client a one-line change.

State is normalized (`ids` + `byId`), and each row selects its own message, so a feedback tap re-renders one
row. Handled in the store and covered by tests:

- Optimistic send (`sending` → `sent` / `failed`), with Retry in place and no duplicates.
- Stale `load` results are ignored; deleting a message mid-send doesn't resurrect it.
- Deleting a replied-to message clears the pending reply; the quote then reads "Original message was deleted".

## Recommendation rendering

`RecommendationCarousel` looks up `registry.resolve(item.type)` for each card. Unknown types fall back to
`GenericCard`, built from the base fields only.

- `type` is an open `string`, so a type from a newer backend degrades gracefully instead of crashing.
- `defineRecommendation<T>({ type, Card })` keeps each card's props typed to its own payload.
- `RecommendationProvider` injects the registry and the press handler (an Alert today, navigation later).

To add a type: create `src/recommendations/types/<name>/index.tsx` and add it to `types/index.ts`.

## Performance

- Inverted `FlatList` with tuned `initialNumToRender` / `windowSize` / `maxToRenderPerBatch`; bottom-anchored,
  so inserts and deletes never yank the viewport.
- Auto-scroll follows my own sends, and incoming messages only when near the bottom.
- `MessageRow` is `memo`'d with primitive props. The carousel uses a fixed card width (`getItemLayout`, snap).
- Press, chip and typing animations run on the UI thread via Reanimated.
- Known weak spot: a feedback tap rebuilds the timeline (O(n)). Fine at chat sizes; I'd fix it by selecting
  only the fields the timeline depends on.

## Trade-offs

- Reanimated is mocked in Jest, so animations are checked by running the app, not by tests.
- No runtime payload validation; a schema (zod) at the API boundary would add it.
- Timestamps are synthesized (the brief's payload has none), and AI replies are canned.
- Reply / Copy / Delete are enabled on user and human messages too, so a failed send can be deleted.
- Delete is immediate: no confirm, no undo.
- Out of scope: pagination, "jump to latest", persistence, dark mode, i18n.
