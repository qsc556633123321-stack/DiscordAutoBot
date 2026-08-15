# Community Concierge Roadmap Embed Ownership Audit

`buildRoadmapEmbed` is a shared runtime helper in `src/systems/communityConcierge.js`. It calls `createCommunityRoadmapFeature().getCommunityRoadmap.execute()`, throws the existing error when the Result is not OK, and delegates rendered embed construction to `createCommunityRoadmapEmbed`.

The same presentation module is also consumed by the `/community-roadmap` command. Therefore this preparation slice does not duplicate, move, or redefine the roadmap builder. A future Concierge presentation builder may receive `buildRoadmapEmbed` as a dependency and must preserve its throw-through behavior and timestamp-bearing embed result.
