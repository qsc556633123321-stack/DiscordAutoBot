# Server Governance v1 Release Candidate

Status: `PHASE_4_REWORK_REQUIRED`.

The production-shaped fixture, projected quality checks, permission matrix, and
administrator-only zero-write dry-run are locally ready. This is not a release
candidate for deployment: active legacy mutation commands can still conflict
with the governance desired state. They must be disabled or hard-guarded before
any major governance rollout.

The release policy reserves `SERVER_GOVERNANCE_EXECUTION_ENABLED=false` as the
future deployment default. No reconcile command is exposed in this slice, so an
execution path is unavailable regardless of environment. Preview and dry-run
are administrator-only and read-only.
