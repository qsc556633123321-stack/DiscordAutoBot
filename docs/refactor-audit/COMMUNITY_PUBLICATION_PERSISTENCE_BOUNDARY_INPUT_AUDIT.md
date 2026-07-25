# Community Publication Persistence Boundary Input Audit

The frozen legacy root is a guild-keyed object. Guide uses `guideChannelId` and
`guideMessageId`; Roadmap uses `roadmapChannelId` and `roadmapMessageId`.
Runtime records may also own native onboarding and unknown fields. Preparation
reads only the publication IDs and preserves all other fields by shallow merge.

Missing guild records map to empty state. Null, arrays, and non-object records
map as empty input for the pure mapper. This slice neither reads files nor
alters the active synchronous JSON runtime.
