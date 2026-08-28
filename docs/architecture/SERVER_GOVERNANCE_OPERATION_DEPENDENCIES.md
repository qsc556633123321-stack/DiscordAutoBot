# Server Governance Operation Dependencies

The compiler emits only explicit operations: `CREATE_CATEGORY`,
`CREATE_CHANNEL`, `MOVE_RESOURCE`, `RENAME_RESOURCE`, `UPDATE_PERMISSIONS`,
`DELETE_CHANNEL`, and `DELETE_CATEGORY`.

Ordering is deterministic: create category, create channel, move, rename,
permission, delete channel, then delete category. Child creates/moves depend
on a newly created parent category. Permission changes for newly created
resources depend on the create operation. A category deletion depends on each
planned child delete or move; missing dependencies or cycles block compilation.

Each operation retains current/expected snapshots, reason, optional human
decision evidence, rollback classification, and rollback metadata. Deletes are
irreversible. Rename/move are reversible. Creates and permission changes are
partially reversible.
