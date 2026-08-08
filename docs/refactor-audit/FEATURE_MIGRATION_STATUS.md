# Feature Migration Status

| Feature | Commands | Application | Domain | Infrastructure | Legacy Runtime | Wrapper | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | list, learn, forget | complete | complete | JSON repository | retained for rollback | commands retained | domain, application, repository, composition, migration | Migrated / Wrapper Remaining |
| Organizer | auto-organize consumer | planning query complete | scoring complete | via Memory composition | retained, inactive consumer | systems facade | application, integration, migration | Migrated / Legacy Source Retained |
| MemberGuard | status, settings, release, active message/join runtime | status, evaluation, settings, release complete | policy complete | JSON repository, permission/role gateways | retained for unrelated compatibility | status, settings, and release legacy aliases are thin presentation wrappers | domain, application, repository, composition, gateway, runtime, migration | Migrated / Wrapper Remaining |
| Audit | dev command audit | complete | command-report policy complete | command-audit gateway | no event runtime exists | legacy alias is a thin presentation wrapper | domain, application, gateway, composition, presentation, runtime, migration | Migrated / Wrapper Remaining |
| Community | `community-about`, `community-roadmap`, `help-me-start` migrated; Guide payload read/render delegated by its compatibility publish consumer; grouped and legacy commands otherwise retained | About, Roadmap, Help-me-start, Guide payload query, welcome contracts, and mapper/builder payload integration complete; active delivery remains legacy | About facts, Roadmap schema, Help-me-start recommendation, Guide payload model complete | read-only content reader complete for Guide; remaining existing | active legacy and compatibility paths retained | About, Roadmap, Help-me-start thin wrappers; Guide payload compatibility delegation; others mixed | About/Roadmap/Help-me-start/Guide slices, lookup characterization, welcome builder integration | Migration In Progress (no full delivery migration approved) |
| Voice | grouped and legacy commands | partial | partial | existing | active | mixed | existing | Deferred / High Risk |
| Layout | grouped and legacy commands | partial | partial | existing | active fallback | mixed | existing | In Migration |
| Permission | grouped and legacy commands | partial | partial | existing | active fallback | mixed | permissions | In Migration |

Status labels are conservative: a feature is not Legacy Free until active runtime references and rollback sources are intentionally retired after a release window.

## Community Discovery Completion Note (2026-07-24)

Community status remains **Migration In Progress**. About, Roadmap, Help-me-start, and onboarding-visibility read paths have migrated wrappers. The Completion Pass documented the remaining boundaries and does not change any remaining feature status.

The Help-me-start cleanup preserves its migrated/thin-wrapper status while moving its Concierge compatibility bridge to `adapters/legacy`, removing the helper's direct Presentation dependency, and validating active behavior against a frozen legacy baseline. The Guide read slice separately preserves its existing setup/publish owner while moving only pure read-model and renderer work behind composition.

Community Mutation Discovery is complete as documentation and integrity-test evidence only. It does not change the Community feature status: **Migration In Progress**.

The Community Guide mutation baseline is also complete as characterization
evidence only. Guide setup/status remains **Dead / No Consumer / Not Migrated**
for legacy migration tracking; no Guide mutation runtime is marked migrated.

The Shared Persistence Contract is **Complete** as discovery/baseline evidence.
It is not a `Persistence Migrated`, `Repository Implemented`, or `Port
Implemented` status; Community remains **Migration In Progress**.

Publication Identity Contract is complete as baseline evidence only. It is not
an Identity Resolver, Duplicate Detection, or Recovery implementation.

Welcome Delivery Result Characterization is complete. Result and Failure Reason
runtime integration remain unapproved; Community remains **Migration In Progress**.

Guide Publication Mutation Plan is prepared but not integrated. Community remains
**Migration In Progress**.

Guide Publication Mutation Execution is characterized and remains legacy-owned;
Community remains **Migration In Progress**.

Guide Publication Mutation Runtime Integration Preparation is complete; no
runtime migration, port, adapter, or persistence replacement is approved.
