# Server Governance Review Decisions

v1.3 adds a persistent, per-guild review-decision workflow without enabling
Discord governance execution. A decision is bound to the exact resource state
reviewed through a deterministic fingerprint of ID, type, name, parent ID,
canonical key, ownership, and lifecycle.

Supported persisted decisions are `KEEP`, `DELETE`, `ADOPT_CANONICAL`, and
`IGNORE_GOVERNANCE`. `UNDECIDED` is implicit. `STALE` and
`ORPHANED_DECISION` are derived safety states and are always execution
blockers. A stale decision cannot silently apply after a rename or move.

`KEEP` and `IGNORE_GOVERNANCE` remove the item from the resolved review
mutation path. `DELETE` produces an approved delete *intent*, never a delete
operation in v1.3. `ADOPT_CANONICAL` requires an existing compatible canonical
target and rejects duplicate adoptions of the same target.

The `/admin server-governance-review` route supports list/show/summary,
individual decide/reset, and one narrow bulk operation: user-managed unknown
resources can only be bulk-ignored after the exact `IGNORE_<count>_RESOURCES`
confirmation. There is intentionally no bulk delete.
