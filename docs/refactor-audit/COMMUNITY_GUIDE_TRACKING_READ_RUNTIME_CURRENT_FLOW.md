# Community Guide Tracking Read Runtime Current Flow

## Active Entry

`src/systems/communityConcierge.js` exports `setupCommunityGuide(guild, options)`.

## Exact Current Ordering

```text
getOrCreateGuideChannel(guild)
-> communityGuideAdapterPairFeature.createAdapterPair({ ensuredChannel: channel })
-> buildGuidePayload(guild)
-> readOnboardingData()[guild.id] || {}
-> fromLegacyPublicationRecord(guild.id, data)
-> state.guide.messageId || data.guideMessageId
-> lookupPort.lookup(...) when tracked ID is truthy and mode is not force
-> Guide mutation input and plan
-> mutationPort.edit(...) or mutationPort.send(...)
-> createCommunityPublicationStateFeature(...)
-> createCommunityGuidePersistenceFeature(...).persist(...)
-> return { channel, message }
```

The future redirect may replace only the three tracked-message read steps with
the shared request and `readTrackedMessage` call. Payload construction, force
behavior, lookup, mutation, persistence, return identity, and failure ordering
must remain unchanged.

## Current Compatibility Expression

```js
publicationState.guide.messageId || data.guideMessageId
```

This includes truthy malformed legacy values and must not be reduced to the
normalized state value alone.
