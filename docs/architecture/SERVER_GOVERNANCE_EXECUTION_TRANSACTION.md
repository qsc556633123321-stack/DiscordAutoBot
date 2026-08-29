# Server Governance Execution Transaction

V1.5 adds a local-only transaction use case for an already immutable approved plan. It verifies the exact active plan, fresh inventory, desired-state and decision fingerprints, confirmation challenge, per-guild lock, and successful-execution history before any gateway call. Runtime and public commands do not wire this use case.

The transaction is persisted as `PENDING`, `VERIFYING`, `LOCKED`, `EXECUTING`, `ROLLING_BACK`, `SUCCEEDED`, `ROLLED_BACK`, `PARTIAL_ROLLBACK`, `FAILED`, `ABORTED`, or `INTERRUPTED_REQUIRES_REVIEW`. Interrupted work is never resumed automatically.
