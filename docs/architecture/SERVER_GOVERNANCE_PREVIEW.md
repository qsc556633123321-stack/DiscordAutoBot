# Server Governance Preview

`/admin server-governance-preview` is administrator-only and read-only. It reads inventory, builds the canonical desired state, plans actions, and renders paginated ephemeral output. It never creates, deletes, moves, renames, changes permissions, or changes roles.

Safe deletes and review deletes are separate sections. The preview always includes a projected final tree and never emits an archive action.
