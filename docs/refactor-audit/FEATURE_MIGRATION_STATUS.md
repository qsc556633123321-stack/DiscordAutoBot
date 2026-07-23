# Feature Migration Status

| Feature | Commands | Application | Domain | Infrastructure | Legacy Runtime | Wrapper | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | list, learn, forget | complete | complete | JSON repository | retained for rollback | commands retained | domain, application, repository, composition, migration | Migrated / Wrapper Remaining |
| Organizer | auto-organize consumer | planning query complete | scoring complete | via Memory composition | retained, inactive consumer | systems facade | application, integration, migration | Migrated / Legacy Source Retained |
| MemberGuard | status, settings, release, active message/join runtime | status, evaluation, settings, release complete | policy complete | JSON repository, permission/role gateways | retained for unrelated compatibility | status, settings, and release legacy aliases are thin presentation wrappers | domain, application, repository, composition, gateway, runtime, migration | Migrated / Wrapper Remaining |
| Audit | dev command audit | complete | command-report policy complete | command-audit gateway | no event runtime exists | legacy alias is a thin presentation wrapper | domain, application, gateway, composition, presentation, runtime, migration | Migrated / Wrapper Remaining |
| Community | `community-about`, `community-roadmap` migrated; grouped and legacy commands otherwise retained | About and Roadmap queries complete; remaining slices not started | About facts/query and Roadmap schema/query complete | read-only About and Roadmap gateways complete; remaining existing | active legacy and compatibility paths retained | About and Roadmap thin wrappers; others mixed | About/Roadmap vertical-slices, architecture, discovery baseline | Migration In Progress (About and Roadmap: Migrated / Thin Wrapper Complete) |
| Voice | grouped and legacy commands | partial | partial | existing | active | mixed | existing | Deferred / High Risk |
| Layout | grouped and legacy commands | partial | partial | existing | active fallback | mixed | existing | In Migration |
| Permission | grouped and legacy commands | partial | partial | existing | active fallback | mixed | permissions | In Migration |

Status labels are conservative: a feature is not Legacy Free until active runtime references and rollback sources are intentionally retired after a release window.

## Community Discovery Completion Note (2026-07-24)

Community status remains **Migration In Progress**. Only About, Roadmap, and onboarding-visibility read paths have migrated wrappers. The Completion Pass documented the remaining boundaries and does not change any remaining feature status.
