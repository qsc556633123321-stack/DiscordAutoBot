# Project Refactor Roadmap

| Feature | Audit | Domain | Application | Infrastructure | Composition | Runtime | Tests | Legacy Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | complete | complete | complete | complete | complete | command consumers | complete | Migrated / Wrapper Remaining |
| Organizer | complete | scoring complete | planning complete | Memory query | complete | facade consumer | complete | Migrated / Legacy Source Retained |
| MemberGuard | complete | complete | status/evaluation/settings/release complete | JSON settings plus Discord mutation gateways | complete | message/join plus command mutations | complete | Migrated / Thin Wrappers Remaining |
| Audit | complete | command-report policy complete | command query complete | command gateway complete | complete | existing command only; no event producer exists | complete | Migrated / Wrapper Remaining |
| Community | complete discovery | Community About facts complete | Community About query complete | read-only About gateway complete | Community About composition complete | active About presentation; other Community paths remain legacy/compatibility | Community About vertical-slice plus discovery baseline | Migration In Progress; Community About Migrated / Thin Wrapper Complete |
| Voice | partial | partial | partial | existing | partial | legacy active | existing | Deferred / High Risk |
| Layout | partial | partial | partial | existing | partial | legacy fallback | existing | In Migration |
| Permission | partial | partial | partial | existing | partial | legacy fallback | permissions | In Migration |
