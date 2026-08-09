# Community Roadmap E2E Schema Field Usage

`roadmapChannelId` and `roadmapMessageId` remain legacy-compatible persisted fields.

- **Allowed application mapping:** `RoadmapPublicationPersistenceRequest` maps semantic channel/message IDs to these fields.
- **Allowed state read:** `setupRoadmapPanel` uses the mapped publication state, then retains `data.roadmapMessageId` as the frozen malformed/truthy legacy lookup fallback.
- **Allowed compatibility code/tests/docs:** shared publication mappers and frozen regression coverage.
- **Blocked:** runtime construction of a raw persistence patch, a second Roadmap repository, or a Roadmap-specific filesystem adapter.

These names are compatibility schema, not evidence that Roadmap itself still owns legacy persistence.
