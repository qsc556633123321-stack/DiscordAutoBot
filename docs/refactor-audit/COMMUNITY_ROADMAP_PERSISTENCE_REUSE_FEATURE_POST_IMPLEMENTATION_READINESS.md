# Community Roadmap Persistence Reuse Feature: Post-Implementation Readiness

## Implemented Boundary

`createCommunityRoadmapPersistenceFeature({ communityPublicationStateFeature })`
is a synchronous Composition factory with one public member: `persist`.

`persist` maps a Roadmap scalar request to the existing generic publication
input, delegates once to
`communityPublicationStateFeature.persistCommunityPublicationRecord.execute`,
and returns the exact result. Generic invariant throws also retain their exact
identity.

## Ownership

- Roadmap request and mapper: Application.
- Generic persistence use case, filesystem adapter, merge, timestamp, and
  writer failure behavior: existing generic publication feature.
- Roadmap reuse feature: Composition-only delegation.
- Runtime persistence sequence: legacy `setupRoadmapPanel` and `saveOnboarding`.

## Candidate Decisions

| Candidate | Decision |
| --- | --- |
| Runtime Persistence Redirect Preparation | Ready next |
| Runtime Persistence Redirect Implementation | Not approved |
| Persistence pair/composition aggregation | Not needed now |
| New Roadmap repository | Rejected |
| Async persistence | Rejected |
| Keep legacy runtime indefinitely | Not selected |

The only approved next slice is Runtime Persistence Redirect Preparation. It
must freeze legacy ordering, partial-success behavior, and result handling
before any runtime call is changed.
