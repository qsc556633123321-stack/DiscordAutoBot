# Community Roles Boundary Discovery

## Current responsibility map

| Concern | Current owner(s) | Read / mutation |
| --- | --- | --- |
| Canonical names, aliases, inheritance/access facts | `domain/community/communityArchitectureV3.js`, `permissionMatrix.js`, legacy permission templates | Read / policy |
| Self-assign options, hierarchy checks, select application | `legacy/systemRuntimes/roleManagerRuntime.js` | Both |
| Role settings | role manager runtime and `role-settings.json` | Both |
| Guest role assignment on join | `systems/welcomeSystem.js` | Mutation |
| Concierge quick role add | `systems/communityConcierge.js` | Mutation |
| Role visibility / overwrites | `communityPermissionService`, legacy Guest Gate and role permissions | Both; Permission Repair-owned |
| Member risk/release behavior | MemberGuard service/runtime | Mutation; MemberGuard-owned |
| Voice relationship | Temp Voice / Night Crew consume role expectations | Indirect; Voice does not own generic self-role logic |

## Read operations

- Available self-assignable role options: `getRoleOptions`.
- Member current roles and formal-role state: `updateMemberRoles` input and helper checks.
- Role configuration/settings: `getRoleSettings`, `roleConfigForName`, `findConfiguredRole`.
- Guest role and role channel discovery: `findGuestRole`, `findRoleChannel`.
- Cleanup candidate scan: `buildGuestCleanupPlan` reads member and role caches before mutation.
- Access facts: `expandRoleKeys`, `getUnlockedCategoriesForRoles`, Permission Matrix.

## Mutation operations

- Create missing self-assignable roles: `setupSelfAssignableRoles`.
- Add/remove selected roles: `updateMemberRoles`.
- Add inherited formal-member role: `syncMemberRoleInheritance`.
- Add/remove/restore guest role: role selection and Welcome System.
- Persist role settings: `updateRoleSettings`.
- Execute guest cleanup queue: `executeGuestCleanup` with rate-limit retry and server logging.
- Apply visibility overwrites: Permission Repair, not role manager.

## Required answers

1. **MemberGuard-owned operations:** newcomer restrictions, release/restriction enforcement, safe-mode decisions, and its own role gateway operations. It is not the owner of role-panel configuration.
2. **Roles Feature operations:** self-assign option presentation, member role selection, inheritance, guest lifecycle policy, role settings, and cleanup plan/queue.
3. **Permission Repair operations:** category access calculation, Guest Gate visibility, overwrite plan creation/application, and channel-child sync.
4. **Voice dependency:** indirect. Night Crew is a role used by voice activity; Temp Voice/LFG check roles for access, but generic role selection must not import Voice runtimes.
5. **Duplicate direct mutation:** yes. Concierge `maybeAddRole` directly adds a role while Role Manager owns hierarchy-aware select mutation and inheritance. This is an explicit future consolidation target, not work for this pass.
6. **Mixed layers:** yes. `roleManagerRuntime` acts as JSON repository, policy evaluator, Discord adapter, retry queue, command-plan store, and logger consumer.
7. **Smallest migration candidate:** read-only `GetAvailableRoles` / `GetMemberRoleState` with an exact role-option fixture. It has no Discord mutation.
8. **Deferred:** all role creation, select menu mutation, inheritance, guest cleanup, hierarchy repair, and overwrite application.

## Role risks

| Risk | Why |
| --- | --- |
| Hierarchy | Bot position and `role.editable` determine whether mutation is legal. |
| Guest lifecycle | Formal role selection can remove/restore guest; this intersects MemberGuard state. |
| Rate limit | Guest cleanup fetches/scans members and mutates roles through a delayed retry queue. |
| Permission semantics | A role add can alter visibility without the roles feature writing an overwrite. |
| Logging | Server-log failures must not change role-mutation success semantics. |
