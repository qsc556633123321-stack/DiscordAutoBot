# Server Governance v1.3 Review Workflow

Status: `SERVER_GOVERNANCE_V13_DECISION_WORKFLOW_READY`.

The governance preview now reloads persisted decisions and renders decision
counts. Administrators can inspect, decide, reset, and safely bulk-ignore
user-managed unknown review resources. Server owners are also accepted by the
review command; moderators without Administrator permission cannot approve a
destructive decision.

The production-shaped fixture begins with 79 undecided items. The regression
workflow bulk-ignores 67 user-managed resources and individually resolves the
12 legacy game items, producing zero undecided/stale/conflict blockers and
`READY_FOR_EXECUTION_REVIEW`. That is a human-review completeness label only;
it is explicitly not production execution readiness.

No Discord structural write path was added. Execution flags remain unchanged
and false by default. No archive behavior, automatic unknown deletion, or bulk
delete was added.
