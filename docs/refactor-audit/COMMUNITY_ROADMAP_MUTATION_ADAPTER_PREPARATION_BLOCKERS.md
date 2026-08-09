# Community Roadmap Mutation Adapter Preparation Blockers

Only a test-only production-shape candidate is approved in this slice.
Production adapter source, Pair mutation surface, composition wiring, runtime
redirect, retry, rollback, and persistence sequencing are out of scope.

The future implementation must preserve strict retained Message ID equality,
exact `M`/`S` identity sources, exact raw rejection identity including
`undefined`, no extra I/O, and no persistence dependency.
