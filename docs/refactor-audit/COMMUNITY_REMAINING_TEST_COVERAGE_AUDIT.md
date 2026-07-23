# Community Remaining Test Coverage Audit

| Area | Existing Tests | Runtime Covered | Mutation Covered | Failure Covered | Gaps | Required Before Migration |
| --- | --- | --- | --- | --- | --- | --- |
| Help-me-start | No focused vertical-slice test found | legacy command only | n/a | no | optional AI success/failure, exact Embed, channel pattern matching | deterministic fallback and success fake, embed snapshot, command reply regression |
| Guide renderer/status | no focused tests | no | no | no | exact custom IDs, content order, stale/missing records | pure payload and status fixtures |
| Guide publish/refresh | no focused tests | legacy only | no focused fixture | no | create/edit/stale message, JSON write, overwrite failure | fake channel/message/repository and compatibility regression |
| Concierge role buttons | no focused tests | interaction fallback only | no | no | missing/uneditable role, hierarchy, exact reply | role gateway fake and output fixture |
| Role selection/inheritance | indirect migration/permission tests only | partial | partial | partial | selected/unselected, guest remove/restore, hierarchy/log failure | role mutation use-case fixtures |
| Guest cleanup | existing mutation tests are MemberGuard-scoped | partial | partial | rate-limit helper partially | fetch once, queue progress, retry/partial error | queue fake, ownership/confirm and summary regression |
| Member add / Welcome | no ordered Community test | event path only | no | DM failures swallowed at runtime | MemberGuard ordering, duplicate join, reminder, missing channel, DM failure | ordered adapter integration fixture |
| Channel panels | no focused vertical slice | legacy runtime only | no | no | stale message, force delete, records, JSON write failure | renderer/publisher split fixtures |
| Proposals | no focused vertical slice | legacy interaction path | no | no | submit/vote/reject/approval partial failure, metadata, auth | separate Game Proposals suite |
| Bootstrap / rebuild | architecture and legacy audit only | plan/execute legacy | no | no | idempotency, permission failure, missing category/channel, confirmation ownership, rollback limits | Layout-owned plan/execution integration fixtures |
| Onboarding visibility | complete migrated query tests | yes | n/a | gateway compatibility | native Discord edge cases | retain current suite; no scope expansion |

No mutation migration should proceed until its listed fixtures exist. Existing quality gate proves architectural constraints, not Discord mutation equivalence.
