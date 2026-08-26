# Server Governance Dry Run

`dry_run` performs the same preflight, ordering, role-resolution, permission
planning, stale-plan checks, and delete-safety evaluation as execute mode.
It does not invoke any mutation gateway write method. Each result includes the
semantic permission details so an administrator can inspect role-level changes
before a later confirmed runtime command is introduced.
