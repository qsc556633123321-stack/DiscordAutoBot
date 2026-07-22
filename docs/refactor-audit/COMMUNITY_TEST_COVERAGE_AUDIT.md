# Community Test Coverage Audit

| Subdomain | Existing coverage | Gap / fake feasibility | Minimum migration gate |
| --- | --- | --- | --- |
| Onboarding visibility inspection | `tests/migration/check-onboarding-visibility.test.js`; architecture and permission scripts. | Gateway still delegates to legacy; no Discord permission cache fake covering all native references. | Preserve regression output, authorization failure, and gateway error tests. |
| Permission matrix / Guest Gate | `scripts/test-permissions.js`, `scripts/test-architecture.js`. | No standalone Community service contract suite; overwrite application lacks exhaustive fake. | Role inheritance/category matrix fixture plus plan/result regression before mutation migration. |
| Bootstrap / V3 rebuild | Architecture script validates facts only. | No plan/execution/partial-failure fixture; no safe fake guild repository. | Create fake guild/channel/role gateway and preview/execution summary fixtures before any extraction. |
| Community guide / Concierge | No dedicated tests found. | Read-only embed builders can be unit tested; setup requires message/channel/JSON fakes. | Start with a read-only command only; fixture output and interaction reply contract. |
| Roles / self roles | Permission script tests matrix facts. | Role hierarchy, add/remove, panel select behavior lack focused regression. | Fake role gateway, hierarchy failures, and idempotent setup fixtures. |
| Proposals / game suggestions | No Community suite found; game service has other coverage. | Card/modal/approval crosses Voice/LFG/game metadata. | Defer until game/Voice contract fixtures exist. |
| Layout / maintenance | Existing layout/architecture scripts, no Community contract suite. | High side effects and legacy fallback. | Defer; use plan-only fixtures first. |
| Dashboard | `npm run dashboard:build` only. | No Community API/UI contract verified. | Build plus a future API contract suite. |

There is intentionally no `npm run test:community` today. Do not add a placeholder script; create it only with a real first Community vertical-slice suite.
