# Community Roadmap Tracking Read Runtime Current Flow

## Active Entry

`src/systems/communityConcierge.js` exports `setupRoadmapPanel(guild)`.

## Exact Current Ordering

```text
getOrCreateRoadmapChannel(guild)
-> communityRoadmapAdapterPairFeature.createAdapterPair({ ensuredChannel: channel })
-> readOnboardingData()[guild.id] || {}
-> fromLegacyPublicationRecord(guild.id, data)
-> state.roadmap.messageId || data.roadmapMessageId
-> buildRoadmapEmbed payload
-> lookupPort.lookupTrackedMessage(...) when tracked ID is truthy
-> mutationPort.edit(...) or mutationPort.send(...)
-> createCommunityPublicationStateFeature(...)
-> createCommunityRoadmapPersistenceFeature(...).persist(...)
-> return { channel, message }
```

The future redirect may replace only the three tracked-message read steps with
the shared request and `readTrackedMessage` call. Lookup, mutation,
persistence, return identity, and failure ordering must remain unchanged.

## Current Compatibility Expression

```js
publicationState.roadmap.messageId || data.roadmapMessageId
```

This includes truthy malformed legacy values and must not be reduced to the
normalized state value alone.
