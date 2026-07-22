# Feature Migration Status

| Feature | Commands | Application | Domain | Infrastructure | Legacy Runtime | Wrapper | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | list, learn, forget | complete | complete | JSON repository | retained for rollback | commands retained | domain, application, repository, composition, migration | Migrated / Wrapper Remaining |
| Organizer | auto-organize consumer | planning query complete | scoring complete | via Memory composition | retained, inactive consumer | systems facade | application, integration, migration | Migrated / Legacy Source Retained |
| MemberGuard | legacy aliases | partial | partial | existing | active | yes | migration | Active Legacy |
| Audit | dev audit | complete | n/a | command gateway | retained aliases | yes | migration | Migrated / Wrapper Remaining |
| Community | grouped and legacy commands | partial | partial | existing | active | mixed | architecture | Active Legacy |
| Voice | grouped and legacy commands | partial | partial | existing | active | mixed | existing | Active Legacy |
| Layout | grouped and legacy commands | partial | partial | existing | active fallback | mixed | existing | In Migration |
| Permission | grouped and legacy commands | partial | partial | existing | active fallback | mixed | permissions | In Migration |

Status labels are conservative: a feature is not Legacy Free until active runtime references and rollback sources are intentionally retired after a release window.
