# Community Roadmap Runtime Pair Creation Approved Diff Forecast

The next implementation may modify only
`src/systems/communityConcierge.js` to:

1. import `createCommunityRoadmapAdapterPairFeature` from Composition;
2. construct one module-level feature; and
3. create a fresh Pair after `getOrCreateRoadmapChannel(guild)` using the exact
   ensured channel object.

It must not call `lookupPort` or `getRetainedMessage`, and it must not modify
the legacy direct fetch, `message.edit`, `channel.send`, `saveOnboarding`, or
the return value. No infrastructure, application, persistence, mutation, Guide,
or data-schema change is approved.
