# Community Guide Mutation Boundary Discovery

## Scope

This boundary covers publication and refresh of the persistent Community Guide
and Roadmap messages. It does not cover the already-migrated Guide read model
or concierge navigation-only replies.

## Active Runtime Entries

- `src/legacy/commands/setup-community-guide.js` -> `execute` -> `/setup-community-guide`.
- `src/legacy/commands/refresh-community-guide.js` -> `execute` -> `/refresh-community-guide`.
- Bootstrap and V3 rebuild runtimes call the same guide setup as a secondary
  best-effort refresh.

## Runtime Call Paths

`src/legacy/commands/setup-community-guide.js` -> `execute` ->
`src/systems/communityConcierge.js:setupCommunityGuide` ->
`getOrCreateGuideChannel` -> `guild.channels.create` / `channel.setParent` /
`channel.permissionOverwrites.set` -> guide channel/category mutation.

`src/legacy/commands/setup-community-guide.js` -> `execute` ->
`setupCommunityGuide` -> `channel.messages.fetch` -> `message.edit` or
`channel.send` -> `saveOnboarding` -> `src/data/onboarding-flows.json`.

`src/legacy/commands/refresh-community-guide.js` -> `execute` ->
`setupRoadmapPanel` -> `getOrCreateRoadmapChannel` -> `message.edit` or
`channel.send` -> `saveOnboarding` -> roadmap record mutation.

## Read Operations

- Guild category/text channel cache and explicit message fetch.
- `onboarding-flows.json` guide and roadmap message IDs.
- Guide and roadmap read-model payload builders.
- `permissionTemplates.onboardingVisible`.

## Mutation Operations

Atomic operations G01-G15 in
`COMMUNITY_MUTATION_OPERATION_MATRIX.md`: locate/create/move guide channel,
apply overwrite, fetch/edit/send guide, persist guide ID, then the analogous
roadmap message operations.

## Data Sources

- `src/data/onboarding-flows.json`.
- Guide content/read compatibility adapter and roadmap feature data.
- `src/config/permissionTemplates.js` through the legacy concierge runtime.

## Persisted Records

Per guild: `guideChannelId`, `guideMessageId`, `roadmapChannelId`,
`roadmapMessageId`, native onboarding recommendations and exclusions.

## Discord Objects Used

Guild, category channel, text channel, permission overwrites, message cache and
fetched message, embeds/components produced by the read model.

## Authorization

Both slash commands require `ManageChannels`. The runtime still relies on the
bot having channel-management and overwrite-management permissions; it does not
preflight every individual permission before starting creation.

## Error Handling

Command handlers defer ephemerally and edit a failure response. Message fetches
turn a missing tracked message into `null`; other create/edit/write failures can
abort the current command after earlier operations have succeeded.

## Retry Behavior

No local retry loop exists for guide or roadmap send/edit. Discord cache/fetch
fallback is a lookup behavior, not a retry contract.

## Idempotency

Category/channel names and stored message IDs are the current idempotency keys.
If a send succeeds but JSON persistence fails, the next run may send a duplicate
panel; this is an existing partial-failure behavior.

## Partial Failure Windows

- Category created, guide channel creation fails.
- Guide channel moved, overwrite application fails.
- Message sent or edited, onboarding record write fails.
- Guide publication succeeds, roadmap publication fails.

## Shared Legacy Helpers

`ensureFile`, `readJson`, `writeJson`, `readOnboardingData`, `saveOnboarding`,
category/channel finders, and the legacy concierge text generator adapter.

## Cross-feature Dependencies

Bootstrap/V3 rebuild may refresh Guide; guild-member onboarding DMs link the
stored guide channel. Panel and permission configuration influence whether the
channel is usable but are not owned here.

## Existing Tests

Guide read, roadmap read, migration, architecture-boundary and legacy-audit
tests exercise payload composition and legacy wiring. No focused mutation fake
guild test currently covers every G01-G15 transition.

## Missing Baseline Tests

- create category/channel versus reuse/move branch;
- overwrite failure after movement;
- send-success/persist-failure duplicate risk;
- tracked-message fetch failure followed by replacement send.

## Candidate Slice Boundaries

A future Guide Mutation slice can own only channel/message publication and the
onboarding record repository, while reusing the already-migrated read feature.

## Explicitly Excluded Responsibilities

Guide content semantics, roadmap domain rules, concierge role buttons, guest
role assignment, native Discord onboarding configuration, Panels, Voice and
layout rebuilding are excluded.

## Blockers

Direct JSON and Discord API calls live in `communityConcierge.js`; no mutation
repository/application service boundary exists yet. Existing bootstrap callers
must retain the same best-effort behavior during migration.

## Recommended Status

Discovery complete; candidate for a dedicated mutation vertical slice after a
baseline fake-guild regression harness is added.

## Baseline Update

The baseline harness, branch matrix and failure-path evidence are now complete.
No production Guide Mutation slice is approved; see
`COMMUNITY_GUIDE_MUTATION_READINESS_DECISION.md`.
