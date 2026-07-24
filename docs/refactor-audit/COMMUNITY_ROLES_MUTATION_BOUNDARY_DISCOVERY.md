# Community Roles Mutation Boundary Discovery

## Scope

Configured Community role creation, self-selection, concierge quick-role
assignment, guest-role removal and role-to-visibility synchronization. It does
not include arbitrary moderator role administration.

## Active Runtime Entries

- `src/legacy/commands/setup-roles.js` -> `/setup-roles`.
- `role_select_menu` through `selectMenuInteractionHandler` compatibility
  dispatch.
- `concierge_games`, `concierge_invest`, `concierge_dev` through the button
  compatibility dispatch.
- `/cleanup-guest-roles` and its `guest_cleanup_confirm_*` confirmation.
- Guild-member onboarding guest assignment is documented under Onboarding.

## Runtime Call Paths

`setup-roles.js` -> `execute` -> `systems/roleManager.js:setupSelfAssignableRoles`
-> configured role resolver -> `guild.roles.create/edit` -> role mapping/panel
mutation.

`interactionGateway` -> select menu handler -> legacy interaction runtime ->
`role_select_menu` -> role manager -> hierarchy validation ->
`member.roles.add/remove` -> role-selection reply.

`buttonInteractionHandler` -> legacy interaction runtime ->
`communityConcierge.js:handleConciergeButton` -> `maybeAddRole` ->
`member.roles.add` -> ephemeral reply.

## Read Operations

Configured role names/settings, guild role cache, bot member/highest role,
member role cache, role settings and visibility matrix/templates.

## Mutation Operations

R01-R07 in the operation matrix: resolve/create role, hierarchy validation,
member add/remove, mapping persistence and visibility permission sync.

## Data Sources

Role manager configuration, role settings JSON, role-channel access settings,
permission matrix/configuration and guild role cache.

## Persisted Records

Role settings/mapping where the setup runtime writes it; member assignments live
in Discord and permission synchronization may update plan/log records.

## Discord Objects Used

Guild roles, bot member hierarchy, target guild members, category/channel
permission overwrites and ephemeral interaction responses.

## Authorization

Setup requires `ManageRoles`; member actions require bot `ManageRoles`, editable
target roles and correct hierarchy. Cleanup skips bots, owner and administrators.

## Error Handling

Hierarchy failures return or log a friendly failure. Queue cleanup reports
success/failure/skip counts; concierge role add deliberately swallows an add
failure before replying with a limited-access message.

## Retry Behavior

Guest-role cleanup queues removals with delay and retries a rate-limited removal
once. Normal select/concierge add/remove paths have no local retry.

## Idempotency

Role setup finds existing configured names; Discord add/remove is naturally
idempotent when role membership is rechecked. Mapping-file failure after role
creation is a known divergence window.

## Partial Failure Windows

- role created before settings mapping persists;
- member role added before visibility synchronization/logging;
- select menu removes one role then later add/remove fails;
- cleanup completes a prefix of members before rate limit or hierarchy failure.

## Shared Legacy Helpers

`systems/roleManager.js`, legacy role permission helpers, safe interaction reply
helpers, server logs and MemberGuard role settings.

## Cross-feature Dependencies

Guest Gate/permission repair, onboarding, concierge navigation, panels, Night
Crew, MemberGuard and bootstrap role setup depend on the same role names.

## Existing Tests

Permission tests and architecture/legacy-boundary tests cover role inheritance
and source ownership. No complete fake member hierarchy mutation baseline exists.

## Missing Baseline Tests

- configured role already exists versus create;
- bot hierarchy exactly below/equal/above target;
- mixed select add/remove atomicity expectations;
- concierge add failure response contract;
- queue rate-limit retry result.

## Candidate Slice Boundaries

Role resolution/hierarchy/member mutation can become a small role application
service. Visibility sync must remain a separate permission consumer.

## Explicitly Excluded Responsibilities

Permission-template design, new member welcome messaging, Discord native
onboarding configuration, role color/order polish and arbitrary admin roles.

## Blockers

Role names are shared with legacy Community and security helpers, and the
current runtime has several direct JSON/Discord call sites.

## Recommended Status

Discovery complete; medium/high risk due hierarchy and shared Guest Gate state.
