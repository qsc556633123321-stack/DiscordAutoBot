# Community Guide Persistence Semantic Boundary Decision

## Recommended: Candidate A — one `GuidePersistenceRequest`

The exact frozen shape is:

```js
{ guildId, channelId, messageId, nativeTaskRecommendations, nativeTaskExcludedChannels }
```

Its mapper emits one legacy-compatible patch with `guideChannelId`, `guideMessageId`, `nativeTaskRecommendations`, and `nativeTaskExcludedChannels`. One request preserves the existing one-write atomic grouping and avoids inventing a second native-task persistence contract.

Candidate B (split publication/native requests) would introduce a second-write partial-success window absent from production. Candidate C (direct generic input) loses Guide semantic ownership. Candidate D remains current runtime only. This slice contains a test-only pure candidate; no production request, mapper, Port, adapter, or Composition feature has been added.
