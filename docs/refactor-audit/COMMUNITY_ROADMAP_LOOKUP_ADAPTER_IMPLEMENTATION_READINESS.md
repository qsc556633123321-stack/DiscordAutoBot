# Community Roadmap Lookup Adapter Implementation Readiness

## Ready next slice

Implement `RoadmapPublicationMessageLookupAdapter` as a production
infrastructure adapter, not wired. It should accept only `{ resourceSession }`,
delegate one lookup, map with Roadmap port factories, propagate invariant
throws, and expose no retained message or Discord resource.

## Not approved

Roadmap pair, composition feature, runtime redirect, mutation boundary, and a
generic publication adapter remain outside the next slice.
