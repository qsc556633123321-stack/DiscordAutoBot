# Project Refactor Roadmap

| Feature | Audit | Domain | Application | Infrastructure | Composition | Runtime | Tests | Legacy Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | complete | complete | complete | complete | complete | command consumers | complete | Migrated / Wrapper Remaining |
| Organizer | complete | scoring complete | planning complete | Memory query | complete | facade consumer | complete | Migrated / Legacy Source Retained |
| MemberGuard | complete | complete | status/evaluation/settings/release complete | JSON settings plus Discord mutation gateways | complete | message/join plus command mutations | complete | Migrated / Thin Wrappers Remaining |
| Audit | complete | command-report policy complete | command query complete | command gateway complete | complete | existing command only; no event producer exists | complete | Migrated / Wrapper Remaining |
| Community | complete discovery | not started | not started | existing | not started | legacy active / compatibility retained | discovery baseline and architecture coverage | Discovery Complete / Migration Not Started |
| Voice | partial | partial | partial | existing | partial | legacy active | existing | Deferred / High Risk |
| Layout | partial | partial | partial | existing | partial | legacy fallback | existing | In Migration |
| Permission | partial | partial | partial | existing | partial | legacy fallback | permissions | In Migration |
