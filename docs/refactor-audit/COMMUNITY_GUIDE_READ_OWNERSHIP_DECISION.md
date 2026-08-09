# Community Guide Read Ownership Decision

## Decision

**C. Mixed: one legal shared read compatibility dependency remains.**

`setupCommunityGuide` calls `readOnboardingData()` once. It reads the guild record, passes it through `fromLegacyPublicationRecord`, and uses `publicationState.guide.messageId || data.guideMessageId` only to recover the tracked Guide publication message ID. The Guide channel ID is not read from legacy state: channel identity comes from `getOrCreateGuideChannel`.

The runtime does not call `fs.readFileSync` or `readJson` directly. The existing Guide read feature is responsible for Guide content/payload, not publication tracking state. Roadmap has an analogous tracked-message-state read, so this is a shared compatibility read concern rather than an unclassified Guide mutation or persistence path.

This dependency prevents an unqualified `CLOSED` label, but is compatible with `CLOSED WITH SHARED READ DEPENDENCY`.
