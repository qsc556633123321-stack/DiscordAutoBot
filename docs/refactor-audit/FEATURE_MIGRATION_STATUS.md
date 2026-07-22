# Feature Migration Status

| Feature | Commands | Application | Domain | Infrastructure | Legacy Runtime | Wrapper | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | list, learn, forget | complete | complete | JSON repository | retained for rollback | commands retained | domain, application, repository, composition, migration | Migrated / Wrapper Remaining |
| Organizer | auto-organize consumer | planning query complete | scoring complete | via Memory composition | retained, inactive consumer | systems facade | application, integration, migration | Migrated / Legacy Source Retained |
| MemberGuard | status, settings, release, active message/join runtime | status, evaluation, settings, release complete | policy complete | JSON repository, permission/role gateways | retained for unrelated compatibility | status, settings, and release legacy aliases are thin presentation wrappers | domain, application, repository, composition, gateway, runtime, migration | Migrated / Wrapper Remaining |
| Audit | dev command audit | complete | command-report policy complete | command-audit gateway | no event runtime exists | legacy alias is a thin presentation wrapper | domain, application, gateway, composition, presentation, runtime, migration | Migrated / Wrapper Remaining |
| Community | grouped and legacy commands | discovery complete | migration not started | existing | active legacy and compatibility paths retained | mixed | architecture plus discovery baseline | Discovery Complete / Migration Not Started |
| Voice | grouped and legacy commands | partial | partial | existing | active | mixed | existing | Deferred / High Risk |
| Layout | grouped and legacy commands | partial | partial | existing | active fallback | mixed | existing | In Migration |
| Permission | grouped and legacy commands | partial | partial | existing | active fallback | mixed | permissions | In Migration |

Status labels are conservative: a feature is not Legacy Free until active runtime references and rollback sources are intentionally retired after a release window.
