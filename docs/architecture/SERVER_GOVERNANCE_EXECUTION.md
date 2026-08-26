# Server Governance Execution

The execution engine consumes an already approved governance plan. It never
classifies resources, fuzzy-matches channels, or changes desired state.

`prepareGovernanceExecutionPlan` adds an expected-state fingerprint to each
operation. `preflightGovernanceExecution` checks guild availability, bot
permissions, canonical roles, review/conflict actions, and live resource
fingerprints before any write. A failed preflight produces zero mutations.

Execution order is category create, channel create, move, rename, permission
reconciliation, channel delete, then category delete. `REVIEW`,
`REVIEW_DELETE`, and `CONFLICT` are permanently non-executable. The engine has
`dry_run` and `execute` modes; dry run returns the same ordered result contract
without calling the mutation gateway.

The infrastructure gateway is the sole owner of Discord channel and overwrite
writes. The feature is not command-wired and is not deployed.
