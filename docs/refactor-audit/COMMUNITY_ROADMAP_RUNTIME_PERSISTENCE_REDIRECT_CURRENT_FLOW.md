# Community Roadmap Runtime Persistence Redirect: Current Flow

## Active Runtime

`src/systems/communityConcierge.js` owns `setupRoadmapPanel(guild)`.

```text
ensure Roadmap channel
-> create Roadmap adapter pair
-> lookup tracked message when an ID is present
-> edit retained message or send and validate the retained sent message
-> saveOnboarding(guild.id, { roadmapChannelId, roadmapMessageId })
-> return { channel, message }
```

`saveOnboarding(guildId, patch)` creates a generic publication state feature
for the legacy onboarding file, calls its persistence use case, and returns
only `.record`. `setupRoadmapPanel` ignores that return value.

## Frozen Semantics

- Persistence is invoked only after a successful Edit or validated Send.
- The current helper and future reuse feature are synchronous at the call site.
- The exact `guild.id`, `channel.id`, and finalized `message.id` are persisted.
- Writer failures are logged and converted by the generic adapter to
  `{ persisted: false, record }`; the runtime still returns the exact Message.
- Generic invariant throws are not writer failures and must retain raw throw
  identity in a future redirect.
- There is no retry, rollback, second persistence write, or second Discord
  mutation in the current success path.
