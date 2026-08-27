# Server Governance v1 Release Candidate

Status: `RC_READY_NOT_DEPLOYED`.

The production-shaped fixture, projected quality checks, permission matrix,
administrator-only zero-write dry-run, and centralized legacy collision guard
are locally ready. Governance mode prevents legacy structural commands and
stored confirmation buttons from mutating governed resources.

First-major-release flags: `SERVER_GOVERNANCE_ENABLED=true` and
`SERVER_GOVERNANCE_EXECUTION_ENABLED=false`. No reconcile command is exposed
in this slice, so an execution path is unavailable regardless of environment.
Preview and dry-run are administrator-only and read-only.
