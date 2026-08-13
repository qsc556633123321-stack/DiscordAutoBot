# Community Role Flow Audit

## Flow present

`handleConciergeButton` calls `maybeAddRole` for games, investment, and
development custom IDs. The helper checks bot `ManageRoles`, resolves a named
editable role, checks hierarchy, calls `member.roles.add`, swallows mutation
failure, and returns a boolean used in the ephemeral reply.

This is a high-risk Runtime-owned mutation flow. No role boundary migration is
approved because the existing behavior needs a dedicated characterization of
permission, hierarchy, and reply semantics.
