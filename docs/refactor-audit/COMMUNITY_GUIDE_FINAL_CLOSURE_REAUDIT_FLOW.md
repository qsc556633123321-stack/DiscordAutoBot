# Community Guide Final Closure Re-Audit Flow

## Runtime Flow

`setupCommunityGuide` in `src/systems/communityConcierge.js` now follows this
exact ownership path:

```text
ensure channel
-> create Guide lookup/mutation adapter pair
-> build payload
-> create tracking compatibility adapter (per invocation)
-> create { guildId, publication: 'guide' } request
-> readTrackedMessage
-> force/lookup decision
-> lookupPort
-> mutation plan
-> mutationPort
-> retained message identity check
-> Guide persistence request
-> Guide persistence feature
-> generic persistence feature
-> return { channel, message }
```

The runtime does not read a raw onboarding record, map it, or access the legacy
`guideMessageId` field. It has no direct Discord fetch/edit/send or persistence
write. `force` still performs the one compatibility read but skips lookup.

## Boundary Ownership

- Tracking read: shared Application request contract plus Infrastructure
  compatibility adapter.
- Lookup and mutation: Guide adapter pair.
- Persistence: Guide persistence feature over the existing generic state
  feature.
- Welcome remains an independent legacy consumer of `guideChannelId`.
