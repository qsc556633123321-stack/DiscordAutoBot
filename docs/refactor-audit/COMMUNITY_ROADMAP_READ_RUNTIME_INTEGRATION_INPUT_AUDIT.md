# Community Roadmap Read Runtime Integration Input Audit

Base: `40d5de1`. Guide already uses `fromLegacyPublicationRecord()` in
`setupCommunityGuide`; Roadmap previously read `data.roadmapMessageId` directly
in `setupRoadmapPanel`. The mapper is exported from
`src/application/community/index.js` and returns
`publicationState.roadmap.messageId` for valid strings.

Scope is one read-only Roadmap existing-message identity decision. Persistence,
mutation, Guide behavior, native onboarding, Bootstrap, Rebuild, adapters,
ports, and write-side mappers remain prohibited.
