# Server Governance v1.4 Approved Plan

Status: `SERVER_GOVERNANCE_V14_APPROVED_PLAN_READY`.

The read-only `/admin server-governance-plan` route can compile, show, and
verify immutable governance candidates. Candidates are stored separately from
review decisions; a new candidate marks the prior active candidate
`SUPERSEDED` and appends a local audit record. Blocked candidates are not
saved as approved plans.

For the 132-current/59-desired fully reviewed fixture, deterministic compiler
output is 24 operations: 6 `CREATE_CHANNEL`, 3 `RENAME_RESOURCE`, 9
`UPDATE_PERMISSIONS`, and 6 `DELETE_CHANNEL`. There are no moves or category
deletes. This result is a frozen regression fact, not a production instruction.

Execution remains disabled. There is no public execute command, archive path,
automatic unknown deletion, or Discord structural write in this slice.
