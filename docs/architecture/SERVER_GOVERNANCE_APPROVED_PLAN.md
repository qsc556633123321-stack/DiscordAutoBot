# Server Governance Approved Plan

v1.4 compiles the canonical desired state, current inventory, and persisted
review decisions into an immutable `ApprovedGovernancePlan`. It is a future
execution candidate only: no v1.4 path invokes Discord channel, category, or
permission mutation.

The plan has schema version 1 and records its guild, compiler identity/time,
three input fingerprints, its logical plan fingerprint, summary, explicit
operations, blockers, and status. `compiledAt` and `compiledBy` are excluded
from the logical fingerprint so the same inputs always identify the same plan.

Statuses are `BLOCKED`, `NO_CHANGES`, and `READY_FOR_EXECUTION_REVIEW`.
The latter means all human review decisions are complete; it is not production
execution or deployment approval.
