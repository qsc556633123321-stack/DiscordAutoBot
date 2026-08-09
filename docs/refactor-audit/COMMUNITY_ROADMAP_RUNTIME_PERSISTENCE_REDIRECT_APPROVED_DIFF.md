# Community Roadmap Runtime Persistence Redirect: Approved Future Diff

## Allowed Future Production Area

`src/systems/communityConcierge.js`, limited to Roadmap persistence following a
successful Edit or validated Send.

## Required Future Shape

1. Construct `createRoadmapPublicationPersistenceRequest` with exact scalar IDs.
2. Delegate through `communityRoadmapPersistenceFeature.persist(request)`.
3. Remove only the Roadmap `saveOnboarding` call.
4. Ignore the persistence result.

## Explicit Exclusions

- No generic persistence internals in runtime.
- No request mapper or generic patch object in runtime.
- No JSON/schema change, writer, repository, adapter, or Port.
- No Guide persistence change.
- No retry, rollback, async wrapper, or changed return shape.
