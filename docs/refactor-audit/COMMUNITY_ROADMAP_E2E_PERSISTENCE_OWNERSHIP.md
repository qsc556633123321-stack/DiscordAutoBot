# Community Roadmap E2E Persistence Ownership

Roadmap runtime creates an immutable `RoadmapPublicationPersistenceRequest` and calls exactly one `communityRoadmapPersistenceFeature.persist(request)` after a successful edit or send.

It does not call `saveOnboarding`, `persistCommunityPublicationRecord.execute`, a repository, or filesystem APIs directly. The Composition feature maps the request to the existing generic publication persistence use case. That writer preserves legacy whole-root shallow-merge behavior, unrelated guild records, Guide fields, native onboarding fields, and its existing writer-failure contract (`persisted:false`, no runtime throw).

`saveOnboarding` remains required by `setupCommunityGuide` and is not Roadmap legacy ownership.
