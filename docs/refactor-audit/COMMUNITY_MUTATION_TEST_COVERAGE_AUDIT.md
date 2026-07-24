# Community Mutation Test Coverage Audit

| Area | Existing evidence | Missing evidence before migration |
| --- | --- | --- |
| Guide payload | frozen Embed/component regression, compatibility consumer, no-mutation boundaries | publish/edit/send, channel existing/missing, JSON persistence failure |
| Guide setup/refresh | command source and runtime discovery | authorization, idempotency, message missing, channel missing, send-before-write failure, retry |
| Panels | existing runtime only | exact payload, tracked-message ownership, force cleanup, JSON/message divergence |
| Roles | existing feature and mutation tests | Community-specific role setup/select integration and hierarchy matrix |
| Onboarding | event runtime exists | event order, DM failure, role/message partial failure, retry/reminder behavior |
| Proposals | runtime paths exist | state machine, approval partial creation, metadata/panel/Voice rollback |
| Maintenance | plans/confirmation paths exist | destructive resource protection and idempotency fixtures |

No mutation slice should be declared complete before it has active-entry, authorization, existing/missing resource, duplicate, partial-failure, retry, exact persistence, and no-unintended-mutation coverage.
