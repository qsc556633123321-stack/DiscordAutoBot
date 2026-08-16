# Game Role Provisioning Contract

## Descriptor

Each provisioning descriptor is dynamically derived from gameRegistry plus
gameAccessPolicy:

gameId, roleKey, roleName, and a legacyRoleName used only for an exact
legacy-like conflict check. The current registry produces ten unique role keys
and ten unique role names.

## Preview

previewGameRoleProvisioning accepts a guild ID and returns existing, wouldCreate,
and conflicts. It performs exact name reads only and has zero mutation.

## Exact Matching and Conflicts

The canonical role name must have exactly one exact Discord match to be reused.
Zero matches plus an exact legacy display-name match is a LEGACY_LIKE_ROLE_NAME
conflict. More than one canonical exact match is a DUPLICATE_EXACT_ROLE_NAME
conflict. Fuzzy, alias, case-insensitive, and emoji-stripped matching are not
used.

## Execute

provisionGameRoles preflights ManageRoles before reading or creating. It creates
only missing roles in registry order with empty permissions, mentionable false,
hoist false, and reason Game role provisioning. It does not create, rename, or
delete the parent game role.

On create failure, no later role is created. Only role IDs created by the
current operation are deleted, in reverse creation order. Existing roles are
never deleted. A rollback failure is recorded with a safe code while the
original create failure remains primary.

## Current Boundary

No runtime caller invokes this feature. It is safe to use in a future explicit
preview and approved execution slice, but it does not mutate the deployed guild
in this slice.
