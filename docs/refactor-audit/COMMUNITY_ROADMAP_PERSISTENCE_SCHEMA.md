# Community Roadmap Persistence: Schema Characterization

The existing data location is `src/data/onboarding-flows.json`; it is not
modified by this slice. The root is an object keyed by exact guild ID strings.
Roadmap publication fields are optional flat fields in one guild record:

```json
{ "guild-id": { "roadmapChannelId": "channel", "roadmapMessageId": "message" } }
```

Guide, welcome, native onboarding, unknown, and other-guild fields survive the
current shallow merge. IDs are not trimmed, cast, or validated here. Missing
fields remain absent until written; a write only replaces patch fields and
`updatedAt` in one guild. No nesting, renaming, file splitting, or schema
rewrite is approved. Missing/malformed/non-object roots start from `{}`.
