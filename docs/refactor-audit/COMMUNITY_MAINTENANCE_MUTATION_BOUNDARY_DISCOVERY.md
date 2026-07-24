# Community Maintenance Mutation Boundary Discovery

## Scope

Privileged plan/confirmation workflows that rename, move, permission-sync,
archive or delete Community resources. Read-only diagnostic commands are
inventoried separately so they are not mistaken for mutation workflows.

## Active Runtime Entries

- `/apply-role-permissions`, `/repair-channel-permissions`.
- `/cleanup-empty-categories`, `/cleanup-guest-roles`, `/dedupe-layout`,
  `/deep-cleanup`, `/factory-reset-server`.
- `/ai-reorganize-server`, `/ai-layout-repair`, `/auto-organize`,
  `/community-architect`, `/polish-server-design`, `/rebuild-server`,
  `/restore-active-channels`.
- `/archive-inactive-games` is proposal/game maintenance and is detailed in the
  Proposals boundary.
- `/layout-doctor` and `/plan-cleanup` are Active Runtime diagnostics with no
  Discord/data mutation.
- Confirmation customIds: `perm_repair_*`, `dedupe_*`, `cleanup_*`,
  `roleperm_*`, `factory_reset_*`, `ai_reorganize_*`, `community_architect_*`,
  `community_v3_*`, `polish_*`, `rebuild_*`, `restore_active_*` and AI layout
  confirmation prefixes in `legacyInteractionRuntime`.

## Runtime Call Paths

`legacy command execute` -> planner -> preview/plan persistence ->
`interactionGateway` -> button handler/legacy interaction runtime -> original
owner confirmation -> executor -> `channel.setName` / `channel.setParent` /
permission overwrite writer / `channel.delete` -> plan, registry and server-log
mutation.

`src/legacy/events/channelDelete.js` -> `execute` ->
`systems/tempVoice.js:handleTempVoiceChannelDelete` -> Temp Voice/LFG/Hub state
cleanup. This active event is recorded only as a protected cross-feature
dependency; Voice implementation is excluded.

## Read Operations

Guild channel/role cache, plan JSON, layout/visibility/permission configuration,
protected-resource lists, Ticket/Temp Voice/LFG metadata, activity data,
confirmation owner and command options.

## Mutation Operations

M01-M10 in the operation matrix: plan, confirmation, rename, move, permission
sync, channel/category delete, metadata cleanup, server logging and inactive game
archive. Each destructive operation requires its own protected-resource and
confirmation precondition.

## Data Sources

Layout repair plans, architect plans, cleanup plans, community-layout registry,
server memory, panel/temp voice/game metadata, permission rules and server logs.

## Persisted Records

Plan IDs and statuses, registry/metadata cleanup, role settings where relevant,
and Discord server-log messages. Some executors use direct legacy JSON writers.

## Discord Objects Used

Categories, text/voice channels, parent relationships, roles, permission
overwrites, confirmation interactions and server-log messages.

## Authorization

Commands enforce management permissions and confirmation owner checks. Executors
also check protected Ticket/log/admin/active Temp Voice resources, but checks are
not centralized in one transaction boundary.

## Error Handling

Planning errors reply without execution. Executors generally catch per-action
errors, continue remaining actions and produce logs/summaries. This intentionally
permits partial completion rather than automatic rollback.

## Retry Behavior

Some writers delay or retry rate-limited Discord actions; not all runtimes use
the same helper. Confirmation itself is not retried after an expired interaction.

## Idempotency

Plan ID plus original requester is the confirmation key. Ensure/repair work is
often repeatable, but destructive actions are irreversible and rely on guards,
limits and resource rechecks rather than a rollback key.

## Partial Failure Windows

- preview plan becomes stale before confirmation;
- rename/move succeeds, subsequent permission sync fails;
- some duplicate resources delete/archive before a later protected check fails;
- Discord resource deletion succeeds but JSON cleanup/log write fails;
- server log fails after a successful destructive action.

## Shared Legacy Helpers

`legacyInteractionRuntime`, layout decision/planner/executor modules, community
bootstrap/rebuilder/polisher helpers, category cleaner, active channel protector,
server logs, role permissions and Temp Voice/Ticket metadata helpers.

## Cross-feature Dependencies

Community architecture, permissions, roles, games, panels, guide, Ticket,
Temp Voice, Voice Hub/LFG, server logs and Dashboard read views can all observe
maintenance output.

## Existing Tests

Architecture, permissions, legacy-audit and legacy-boundary tests validate
static constraints. No complete destructive fake-guild transaction regression
suite currently proves each plan/executor pair.

## Missing Baseline Tests

- expired/stale confirmation plan;
- original-owner versus other-user confirmation;
- protected Ticket/log/active Temp Voice denial;
- rename/move success followed by overwrite failure;
- delete success followed by metadata/log failure;
- rate-limit retry summary consistency.

## Candidate Slice Boundaries

Permission repair is the narrowest mutation candidate. Destructive cleanup,
factory reset and AI reorganize remain blocked until plan repository and Discord
writer contracts are independently baselined.

## Explicitly Excluded Responsibilities

Voice lifecycle, Ticket business rules, AI recommendation generation, Guide
content reads, Panel payload semantics and Dashboard presentation are excluded.

## Blockers

Many command-specific executors duplicate plan ownership, JSON and Discord write
logic. Their behavior is high-risk and cannot be consolidated safely in this
Discovery-only pass.

## Recommended Status

Discovery complete; mixed risk. Permission repair can be prepared next, while
destructive maintenance remains explicitly blocked.
