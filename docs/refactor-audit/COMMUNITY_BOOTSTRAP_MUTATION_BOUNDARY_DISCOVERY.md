# Community Bootstrap Mutation Boundary Discovery

## Scope

Initial layout bootstrap and V3/layout rebuild operations that create, locate,
move, rename and permission-sync Community structure. This document records the
current runtime; it does not endorse destructive archive/delete policy.

## Active Runtime Entries

- `src/legacy/commands/bootstrap-community.js` -> `/bootstrap-community`.
- `src/legacy/commands/rebuild-community-layout.js` ->
  `/rebuild-community-layout`.
- `src/legacy/commands/rebuild-community-v3.js` ->
  `/rebuild-community-v3`.
- Bootstrap/rebuild confirmation buttons are routed by
  `src/legacy/interactions/legacyInteractionRuntime.js`.

## Runtime Call Paths

`bootstrap-community.js` -> `execute` -> community rebuild facade / legacy
bootstrap runtime -> ensure category/channel/role -> `guild.channels.create`,
`guild.roles.create/edit`, `channel.setParent`, overwrite writer -> registry
and guide/panel refresh mutations.

`rebuild-community-v3.js` -> `execute` -> V3 builder runtime -> confirmation
button -> V3 executor -> ensure/move/rename/sync/cleanup -> Discord objects and
community layout registry/data mutation.

## Read Operations

Architecture/config keys, channel and role cache, layout registry, game metadata,
permission templates, protected-resource rules and confirmation plans.

## Mutation Operations

Atomic bootstrap operations B01-B10 in the operation matrix: resolve registry,
create category/channel, move/rename, role update, category/child permission
sync, guide/panel refresh, and obsolete-resource handling.

## Data Sources

Community architecture/config files, layout registry JSON, game category and
create-entry metadata, panel/onboarding records, role configuration.

## Persisted Records

Community layout registry entries, game/create-entry metadata, confirmation plan
records, role mappings and panel/onboarding message records as secondary writes.

## Discord Objects Used

Guild categories/text/voice channels, roles, permission overwrites, messages,
and server-log channel.

## Authorization

Privileged slash commands use preview/execute confirmation flows. Bot hierarchy
and Discord permissions are checked by individual helpers, not one transaction
preflight.

## Error Handling

Executors collect per-item failures and continue where possible. This can leave
a partially constructed layout, then return a summary rather than roll back.

## Retry Behavior

Legacy builders use delayed/queued calls in several paths; exact retry behavior
is helper-specific. No all-or-nothing transaction exists.

## Idempotency

Stable layout keys, normalized aliases, registry IDs and ensure helpers reduce
duplication. Alias/registry drift remains a known risk.

## Partial Failure Windows

- category created before child/permission step;
- channel moved before overwrite sync;
- role changed before role visibility sync;
- core layout succeeds but guide/panel best-effort refresh fails;
- obsolete item action succeeds before its registry cleanup.

## Shared Legacy Helpers

`communityBootstrapSystem`, `communityV3BuilderRuntime`,
`communityStructureManager`, `serverRebuilder`, `serverPolisher`, game channel
helpers, permission builders, server logs and panel/guide helpers.

## Cross-feature Dependencies

Permissions, game identity/category metadata, Temp Voice create entries, Panels,
Guide, roles, logs and maintenance cleanups all participate.

## Existing Tests

Architecture, permission and legacy boundary tests cover static rules. No full
fake-guild bootstrap contract test covers create/move/role/panel sequencing.

## Missing Baseline Tests

- repeat bootstrap idempotency with registry/cache disagreement;
- category creation followed by child create failure;
- role hierarchy failure after channel creation;
- rebuild confirmation ownership and partial-failure summary.

## Candidate Slice Boundaries

First split a narrow `ensure layout category/channel` writer from destructive
cleanup and secondary panel/guide refresh. Do not migrate full V3 in one slice.

## Explicitly Excluded Responsibilities

AI layout recommendations, Ticket runtime, Temp Voice lifecycle, content
semantics and Dashboard actions are excluded.

## Blockers

The current path combines structure policy, direct Discord writes, JSON stores,
role writes and downstream refreshes; a migration requires a deterministic fake
guild baseline before extracting application workflow.

## Recommended Status

Discovery complete; blocked/high-risk, not the next migration candidate.
