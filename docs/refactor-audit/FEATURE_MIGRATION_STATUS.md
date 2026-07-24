# Feature Migration Status

| Feature | Commands | Application | Domain | Infrastructure | Legacy Runtime | Wrapper | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | list, learn, forget | complete | complete | JSON repository | retained for rollback | commands retained | domain, application, repository, composition, migration | Migrated / Wrapper Remaining |
| Organizer | auto-organize consumer | planning query complete | scoring complete | via Memory composition | retained, inactive consumer | systems facade | application, integration, migration | Migrated / Legacy Source Retained |
| MemberGuard | status, settings, release, active message/join runtime | status, evaluation, settings, release complete | policy complete | JSON repository, permission/role gateways | retained for unrelated compatibility | status, settings, and release legacy aliases are thin presentation wrappers | domain, application, repository, composition, gateway, runtime, migration | Migrated / Wrapper Remaining |
| Audit | dev command audit | complete | command-report policy complete | command-audit gateway | no event runtime exists | legacy alias is a thin presentation wrapper | domain, application, gateway, composition, presentation, runtime, migration | Migrated / Wrapper Remaining |
| Community | `community-about`, `community-roadmap`, `help-me-start` migrated; grouped and legacy commands otherwise retained | About, Roadmap, and Help-me-start queries complete; remaining mutation/orchestration slices not started | About facts, Roadmap schema, Help-me-start recommendation complete | read-only gateways/adapters complete for migrated slices; remaining existing | active legacy and compatibility paths retained | About, Roadmap, and Help-me-start thin wrappers; others mixed | About/Roadmap/Help-me-start vertical-slices, architecture, discovery baseline | Migration In Progress (three read slices: Migrated / Thin Wrapper Complete) |
| Voice | grouped and legacy commands | partial | partial | existing | active | mixed | existing | Deferred / High Risk |
| Layout | grouped and legacy commands | partial | partial | existing | active fallback | mixed | existing | In Migration |
| Permission | grouped and legacy commands | partial | partial | existing | active fallback | mixed | permissions | In Migration |

Status labels are conservative: a feature is not Legacy Free until active runtime references and rollback sources are intentionally retired after a release window.

## Community Discovery Completion Note (2026-07-24)

Community status remains **Migration In Progress**. About, Roadmap, Help-me-start, and onboarding-visibility read paths have migrated wrappers. The Completion Pass documented the remaining boundaries and does not change any remaining feature status.

The Help-me-start cleanup preserves its migrated/thin-wrapper status while moving its Concierge compatibility bridge to `adapters/legacy`, removing the helper's direct Presentation dependency, and validating active behavior against a frozen legacy baseline.
