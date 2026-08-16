# Game Role Provisioning Pattern Audit

## Existing Role Mutation Boundaries

The legacy role manager creates only its existing self-assignable roles and
must remain unchanged. CommunityRoleQuickActionUseCase adds the existing parent
role 🎮 遊戲玩家 through CommunityRoleMutationGateway. MemberGuard uses a
separate member-role gateway for member mutation.

None of those boundaries provision specific game roles. Reusing them would
couple a new registry-driven role inventory to legacy UI or member assignment.

## Selected Pattern

Game Role Provisioning uses a dedicated Application use case, a dedicated
Discord Infrastructure gateway, and a small Composition feature:

Application decides canonical descriptors, exact matching, conflict policy,
sequential create ordering, and rollback ownership. Infrastructure resolves a
guild, preflights ManageRoles, and performs exact lookup, create, and delete by
role ID. Composition injects resolveGuild but is not imported by runtime.

## Compatibility Guard

roleManagerRuntime.js, permissionMatrix.js, Community Role Quick Action, ready
startup, role selector, and existing deployment files remain unchanged.
