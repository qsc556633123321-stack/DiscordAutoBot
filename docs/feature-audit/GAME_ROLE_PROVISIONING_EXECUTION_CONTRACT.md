Game Role Provisioning Execution Command Contract
Command: /admin game-role-provision confirm:CREATE_GAME_ROLES.
Authorization: existing Administrator permission guard. The confirmation is exact and case-sensitive.
Flow: authorize, confirm, fresh preview, conflict guard, nothing-to-create guard, provision, render.
Safety: only the existing provisionGameRoles use case creates roles. The command does not directly create, delete, rename, assign, or change permissions. Parent game role, member roles, channels, and startup remain unchanged.
Fresh preview conflicts block execution. With no missing role, it returns the already-provisioned success message without calling provisionGameRoles. The existing use case owns exact matching, sequential creation, and created-ID-only rollback.
