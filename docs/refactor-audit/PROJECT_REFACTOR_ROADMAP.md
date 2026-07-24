# Project Refactor Roadmap

| Feature | Audit | Domain | Application | Infrastructure | Composition | Runtime | Tests | Legacy Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | complete | complete | complete | complete | complete | command consumers | complete | Migrated / Wrapper Remaining |
| Organizer | complete | scoring complete | planning complete | Memory query | complete | facade consumer | complete | Migrated / Legacy Source Retained |
| MemberGuard | complete | complete | status/evaluation/settings/release complete | JSON settings plus Discord mutation gateways | complete | message/join plus command mutations | complete | Migrated / Thin Wrappers Remaining |
| Audit | complete | command-report policy complete | command query complete | command gateway complete | complete | existing command only; no event producer exists | complete | Migrated / Wrapper Remaining |
| Community | complete discovery | Community About facts, Roadmap schema, and Help-me-start recommendation complete | About, Roadmap, and Help-me-start queries complete | read-only gateways/adapters complete for three slices | About, Roadmap, and Help-me-start compositions complete | active About/Roadmap/Help-me-start presentations; other Community paths remain legacy/compatibility | three read vertical-slices plus discovery baseline | Migration In Progress; About, Roadmap, and Help-me-start Migrated / Thin Wrapper Complete |
| Voice | partial | partial | partial | existing | partial | legacy active | existing | Deferred / High Risk |
| Layout | partial | partial | partial | existing | partial | legacy fallback | existing | In Migration |
| Permission | partial | partial | partial | existing | partial | legacy fallback | permissions | In Migration |

## Community Discovery Completion Note (2026-07-24)

`/help-me-start` read-only recommendation is complete. The next Community work remains intentionally unselected; all mutation/orchestration paths are still behind MemberGuard, Permission Repair, Layout, Voice, or separate Game Proposals boundaries.

The Help-me-start cleanup establishes the intended boundary pattern for future Community read slices: legacy bridge in `adapters/legacy`, Composition-owned compatibility wiring, and frozen-baseline regression rather than helper-to-runtime comparison.
