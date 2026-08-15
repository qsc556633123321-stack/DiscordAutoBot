# Community Publication Persistence Semantics Audit

## Shared implementation and root
Guide and Roadmap use distinct semantic composition features, but both delegate to one `CommunityPublicationStateFilesystemAdapter` implementation and one `onboarding-flows.json` root object.

## Subtrees and merge
- Guide writes `guideChannelId`, `guideMessageId`, native task recommendations, and excluded channels.
- Roadmap writes `roadmapChannelId` and `roadmapMessageId`.
- The adapter shallow-merges the target guild record, preserves unrelated properties in that record, and preserves other guild root entries.

## Failure and ordering
Both writes occur synchronously after finalized Edit/Send mutation. Missing directory/file is created. Invalid/non-object JSON and read errors log and use `{}`; subsequent write may succeed. Write errors log and return `persisted: false` with the calculated record. Neither semantic feature adds a different failure policy.

## Characterization coverage
The preparation candidate compares explicit runtime paths with adapter defaults for valid, missing, malformed, read-failure, and write-failure states. It also freezes sequential Guide/Roadmap writes, identity, unrelated-root preservation, and filesystem operation counts.
