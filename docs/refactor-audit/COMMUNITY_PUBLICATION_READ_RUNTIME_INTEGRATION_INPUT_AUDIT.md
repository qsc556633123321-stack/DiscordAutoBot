# Community Publication Read Runtime Integration Input Audit

Domain state is in `src/domain/community/communityPublicationState.js`. The
pure mapper is exported from `src/application/community/index.js` as
`fromLegacyPublicationRecord(guildId, record)`. It accepts a legacy guild record
and returns frozen `{ guildId, guide: { channelId, messageId }, roadmap: ... }`.
Missing, null, undefined, primitive, or array records map to empty state; unknown
fields are deliberately not represented or mutated. The mapper is pure and does
not mutate input.

Approved scope: one Guide existing-publication read in `setupCommunityGuide`.
Prohibited: write mapping, patching, ports, adapters, composition, persistence,
Roadmap, native onboarding, bootstrap, rebuild, and mutation integration.
Persistence, writer, and mutation decisions remain not approved.
