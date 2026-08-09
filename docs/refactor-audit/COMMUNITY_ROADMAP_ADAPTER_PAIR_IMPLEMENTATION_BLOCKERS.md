# Community Roadmap Adapter Pair Implementation Blockers

## Base

- Commit: `646ad3a docs: prepare community roadmap adapter pair`

## Approved production scope

Only `src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js` is approved. It composes one existing Roadmap Resource Session and one existing Lookup Adapter into a narrow, per-invocation pair.

## Explicitly excluded

- Roadmap composition feature
- Runtime pair creation or lookup redirect
- Mutation port, mutation adapter, and mutation plan
- Application, persistence, Guide, bootstrap, and rebuild changes

## Completion conditions

- Architecture score remains 100 with no circular or reverse dependencies.
- Pair has no retained Session or mutation surface publicly exposed.
- Runtime remains legacy-owned.
