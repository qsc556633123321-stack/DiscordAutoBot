# Community Roadmap Persistence: Current Runtime Flow

This is a frozen description of base `56beaa7`; it does not replace runtime.

`setupRoadmapPanel(guild)` in `src/systems/communityConcierge.js` ensures the
Roadmap channel, creates a per-invocation Pair, looks up a tracked message,
then edits it or sends a new one through the Pair. Only after the successful
mutation and exact raw Message handoff, it synchronously calls:

```js
saveOnboarding(guild.id, {
  roadmapChannelId: channel.id,
  roadmapMessageId: message.id
});
```

The call is not awaited and its return value is ignored. The function returns
the same `{ channel, message }` after persistence. Ordering is ensure, Pair,
lookup, Edit/Send, retained identity validation, save, return. There is no
retry, rollback, second mutation, or compensating action.

If a writer failure is swallowed, the Discord mutation remains successful and
the function still resolves with the exact edited/sent Message.
