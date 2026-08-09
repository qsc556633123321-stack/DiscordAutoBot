# Community Roadmap Lookup Adapter Implementation Readiness

## Completed

`RoadmapPublicationMessageLookupAdapter` is now implemented as a production
infrastructure adapter and remains not wired. It accepts only
`{ resourceSession }`, delegates one lookup, maps with Roadmap port factories,
propagates invariant throws, and exposes no retained message or Discord
resource.

## Ready next slice

Prepare the Roadmap adapter-pair boundary. A future runtime needs both lookup
results and the Resource Session retained-message handoff, but no pair,
composition feature, or runtime redirect is approved yet.

## Not approved

Roadmap pair, composition feature, runtime redirect, mutation boundary, and a
generic publication adapter remain outside the next slice.
