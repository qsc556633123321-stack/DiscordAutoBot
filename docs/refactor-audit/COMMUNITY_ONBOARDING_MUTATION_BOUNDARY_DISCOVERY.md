# Community Onboarding Mutation Boundary Discovery

## Scope

The `guildMemberAdd` runtime: MemberGuard evaluation handoff, optional guest-role
assignment, welcome-channel message, welcome DM, one-time reminder scheduling
and guide link. Native Discord onboarding setup is not implemented as a direct
Discord API mutation in this boundary.

## Active Runtime Entries

- `src/events/guildMemberAdd.js` -> `execute` -> `Events.GuildMemberAdd`.
- Guide setup persists recommendation metadata consumed by onboarding, but it is
  covered by the Guide boundary rather than treated as a second onboarding entry.

## Runtime Call Paths

`src/events/guildMemberAdd.js` -> `execute` -> MemberGuard evaluation ->
`systems/welcomeSystem.js:handleGuildMemberAdd` -> guest role helper ->
`guild.roles.create` / `member.roles.add` -> welcome `channel.send` -> reminder
state/timer mutation.

`src/events/guildMemberAdd.js` -> `execute` ->
`systems/communityConcierge.js:sendConciergeWelcome` -> guide lookup ->
`member.send` -> DM containing the guide URL.

## Read Operations

Welcome settings, MemberGuard settings/state, guild role/channel caches,
onboarding record/guide channel ID, reminder Map/JSON state and member account
information.

## Mutation Operations

O01-O08 in the operation matrix: resolve/create/add guest role, channel welcome,
DM, reminder schedule/state and guide-link delivery.

## Data Sources

`welcome-settings.json`, MemberGuard data/settings, `onboarding-flows.json`,
role settings and configured channel name matching.

## Persisted Records

Welcome/reminder state if enabled, MemberGuard counters/state and Discord member
role membership. Concierge DM itself has no local persisted record.

## Discord Objects Used

Guild member, guest role, welcome text channel, guide text channel, direct
message channel and scheduled reminder target.

## Authorization

Event executes as the bot. Role addition requires editable guest role and bot
hierarchy; MemberGuard/welcome logic skips bot/admin contexts. DMs require user
privacy settings to allow them.

## Error Handling

`guildMemberAdd.execute` isolates each phase in its own `try/catch`; a
MemberGuard or welcome error does not prevent the concierge DM attempt. DM
failures are intentionally swallowed.

## Retry Behavior

No retry loop exists for guest-role assignment, welcome send or DM. Reminder
scheduling is one-shot and may not survive process restart unless its state
record is consulted by the runtime.

## Idempotency

Member role membership and reminder state/Map are the practical keys. Replayed
events can still duplicate a welcome message if state is not written before a
crash; that is an existing behavior to preserve for now.

## Partial Failure Windows

- guest role is created/added but welcome send fails;
- welcome message sends before reminder state persists;
- guide lookup succeeds but DM fails;
- timer schedules before later JSON write fails.

## Shared Legacy Helpers

`systems/welcomeSystem.js`, `systems/memberGuard.js`, `systems/roleManager.js`,
`systems/serverLogs.js`, and concierge onboarding JSON helpers.

## Cross-feature Dependencies

Guest Gate permissions, role inheritance, Guide publication, MemberGuard safe
mode, Link Guard strict mode and role-select verification all affect the member
after this event.

## Existing Tests

MemberGuard architecture tests cover policy boundaries; no complete fake member
join mutation baseline exercises guest role, welcome, DM and reminder together.

## Missing Baseline Tests

- guest role absent/create/add branch;
- DM privacy failure without channel-message regression;
- duplicate join/restart reminder behavior;
- MemberGuard failure isolation across subsequent phases.

## Candidate Slice Boundaries

Onboarding mutation can be split into guest provisioning and welcome delivery;
the guide DM link is a small adapter consumer, not part of Guide publication.

## Explicitly Excluded Responsibilities

Role select UI, server-guide content publication, native Discord onboarding API,
Temp Voice/LFG restrictions and MemberGuard risk policy are excluded.

## Blockers

The event currently orchestrates systems directly, and reminder durability is
mixed between memory and legacy JSON state.

## Recommended Status

Discovery complete; medium risk and a later vertical slice after role mutation
baselines exist.
