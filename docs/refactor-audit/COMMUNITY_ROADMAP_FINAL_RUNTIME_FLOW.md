# Community Roadmap Final Runtime Flow

Audited at `0fc891d`. The only runtime entry is `setupRoadmapPanel(guild)` in `src/systems/communityConcierge.js`.

1. **Runtime** calls `getOrCreateRoadmapChannel(guild)` to ensure the target channel.
2. **Composition** creates one per-invocation Pair through `communityRoadmapAdapterPairFeature.createAdapterPair({ ensuredChannel: channel })`.
3. **Runtime/Application** reads the legacy publication record, maps it with `fromLegacyPublicationRecord`, and obtains the tracked roadmap message ID.
4. **Application/Infrastructure** calls `lookupPort.lookupTrackedMessage`. The Pair's Lookup Adapter delegates to its single Resource Session.
5. **Infrastructure** retains the exact fetched Message in that Session. Runtime receives it only through `getRetainedMessage()`.
6. **Runtime** builds the existing payload with `buildRoadmapEmbed()`.
7. **Application/Infrastructure** uses `mutationPort.edit` for an available Message, otherwise `mutationPort.send`; the same Session owns the Discord call and retains the exact Message.
8. **Runtime** recovers the retained raw Message and validates the existing send identity invariant.
9. **Application** creates `createRoadmapPublicationPersistenceRequest({ guildId, channelId, messageId })`.
10. **Composition/Persistence** calls `communityRoadmapPersistenceFeature.persist(request)`, which maps to the generic publication persistence use case and its existing filesystem writer.
11. **Runtime** returns `{ channel, message }` without retry or rollback.

`setupRoadmapPanel` has no direct Discord fetch/edit/send, repository, or filesystem operation. Guide `saveOnboarding` is outside this Roadmap flow and remains legacy-owned.
