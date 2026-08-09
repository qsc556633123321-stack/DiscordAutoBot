# Community Roadmap Runtime Pair Entry Audit

## Active entry

`src/systems/communityConcierge.js`
→ `setupRoadmapPanel(guild)`
→ `getOrCreateRoadmapChannel(guild)`
→ read `onboarding-flows.json`
→ `fromLegacyPublicationRecord(guild.id, data)`
→ truthy `roadmapMessageId` direct `channel.messages.fetch(id).catch(() => null)`
→ `message.edit(payload)` or `channel.send(payload)`
→ `saveOnboarding(guild.id, { roadmapChannelId, roadmapMessageId })`
→ `{ channel, message }`.

## Frozen ordering

1. Ensure the Roadmap channel.
2. Use that exact ensured channel for payload publication.
3. Read persisted state and resolve the legacy-compatible message id.
4. Perform the legacy lookup.
5. Edit if a message is available; otherwise send.
6. Persist after the Discord mutation succeeds.
7. Return the ensured channel and resulting message.

The runtime presently owns lookup, edit/send, persistence timing, errors, and
return shape. Pair creation is not currently part of the call path.
