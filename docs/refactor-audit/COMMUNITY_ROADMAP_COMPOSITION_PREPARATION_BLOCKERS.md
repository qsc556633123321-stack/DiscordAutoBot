# Community Roadmap Composition Preparation Blockers

## Base

- Commit: `f2d21ac feat: add community roadmap adapter pair`

## Resolved by this preparation slice

- Composition feature name: `communityRoadmapAdapterPairFeature`.
- Factory name: `createCommunityRoadmapAdapterPairFeature`.
- Candidate uses default production Pair Factory with an optional test override.
- Public feature surface is only `createAdapterPair`.

## Still blocked

- No production composition feature is implemented.
- Runtime must not import the Pair Factory, Session, or Lookup Adapter.
- No mutation, persistence, or generic publication abstraction is approved.
