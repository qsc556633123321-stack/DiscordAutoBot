# Community Roadmap Persistence Schema Freeze

Frozen: root object keyed by exact guild ID; flat `roadmapChannelId` and
`roadmapMessageId`; preservation of Guide, welcome, native onboarding,
unknown, and other-guild fields; writer-owned `updatedAt`; two-space JSON and
trailing newline; no normalization, nesting, splitting, or rewrite. The formal
JSON file remains unchanged.
