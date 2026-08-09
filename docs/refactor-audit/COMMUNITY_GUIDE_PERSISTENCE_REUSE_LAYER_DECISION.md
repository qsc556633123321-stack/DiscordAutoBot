# Community Guide Persistence Reuse: Layer Decision

| Candidate layer | Decision |
| --- | --- |
| Application helper | Rejected: it would need a concrete generic composition feature. |
| Composition feature | Approved: inject the generic feature and hide generic patch shape from future runtime. |
| Runtime direct generic usage | Rejected: exposes generic persistence details to `setupCommunityGuide`. |
| Infrastructure writer/repository | Rejected: duplicates the shared persistence owner. |

Recommended production name: `createCommunityGuidePersistenceFeature`.
Its only dependency is `communityPublicationStateFeature`; its public surface
is `{ persist }`. `persist(request)` must use the existing Guide request mapper,
call generic `.execute` once synchronously, and pass its result or thrown value
through unchanged.
