# Guide Runtime Pair Creation Flow Audit

`setupCommunityGuide(guild, options)` validates through the existing channel
ensure path, then builds payload, reads the guild record, reads its tracked
message ID, conditionally fetches it unless `force`, builds a mutation Plan,
edits or sends, persists publication state, and returns `{ channel, message }`.
Roadmap publication is a separate `setupRoadmapPanel` path. Command-level
defer/reply handling is outside this function.
