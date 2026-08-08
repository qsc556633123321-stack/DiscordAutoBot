# Project Refactor Roadmap

| Feature | Audit | Domain | Application | Infrastructure | Composition | Runtime | Tests | Legacy Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Memory | complete | complete | complete | complete | complete | command consumers | complete | Migrated / Wrapper Remaining |
| Organizer | complete | scoring complete | planning complete | Memory query | complete | facade consumer | complete | Migrated / Legacy Source Retained |
| MemberGuard | complete | complete | status/evaluation/settings/release complete | JSON settings plus Discord mutation gateways | complete | message/join plus command mutations | complete | Migrated / Thin Wrappers Remaining |
| Audit | complete | command-report policy complete | command query complete | command gateway complete | complete | existing command only; no event producer exists | complete | Migrated / Wrapper Remaining |
| Community | complete discovery | Community About facts, Roadmap schema, Help-me-start recommendation, and Guide payload model complete | About, Roadmap, Help-me-start, Guide payload query complete | read-only content reader complete for Guide | About, Roadmap, Help-me-start, and Guide payload compositions complete | active About/Roadmap/Help-me-start presentations plus Guide payload delegation; status, setup/publish and other Community paths remain legacy/compatibility | four read vertical-slices plus discovery baseline | Migration In Progress; Guide status/setup mutation retained |
| Voice | partial | partial | partial | existing | partial | legacy active | existing | Deferred / High Risk |
| Layout | partial | partial | partial | existing | partial | legacy fallback | existing | In Migration |
| Permission | partial | partial | partial | existing | partial | legacy fallback | permissions | In Migration |

## Community Discovery Completion Note (2026-07-24)

`/help-me-start` read-only recommendation is complete. The next Community work remains intentionally unselected; all mutation/orchestration paths are still behind MemberGuard, Permission Repair, Layout, Voice, or separate Game Proposals boundaries.

The Help-me-start cleanup establishes the intended boundary pattern for future Community read slices: legacy bridge in `adapters/legacy`, Composition-owned compatibility wiring, and frozen-baseline regression rather than helper-to-runtime comparison. The Guide read slice applies the same rule while retaining `communityConcierge` as the publish/mutation owner.

The Community Mutation Runtime Discovery documents active mutation boundaries and blocked candidates. It is not a migration milestone and does not retire legacy runtime owners.

The subsequent Community Guide Mutation Baseline freezes legacy behavior only.
It does not add a production mutation slice, retire a Guide runtime owner, or
change Community's **Migration In Progress** status.

The Shared Persistence Contract adds no production implementation. It freezes
the existing onboarding-flow schema and failure behavior for a later decision.

The Publication Identity Contract records current identity ambiguity; it does
not introduce a new Community production owner.

The Guide welcome channel lookup is now characterized with frozen tests. It is
not integrated through a new runtime boundary; Community remains **Migration In
Progress** and no lookup runtime slice is approved.

Welcome Delivery Preparation adds pure application contracts only. The existing
member-DM runtime remains the owner until a separately approved boundary exists.

Welcome Delivery Result Characterization is complete. It authorizes no port,
adapter, Result return shape, or full delivery migration.

The Welcome Message Builder Runtime Integration now delegates only inline payload
construction through the Application barrel. It does not move lookup, delivery,
error handling, persistence, or runtime ownership.

Guide publication mutation has completed Plan and execution preparation. The
next possible scoped review is Plan-controlled edit/send only; runtime remains
unchanged.

## Community Guide Publication Position (2026-08-08)

Publication persistence has moved into the new architecture without changing
its legacy compatibility semantics. Guide Discord message mutation remains a
separate legacy boundary. Do not treat the existing Execution Request contract
as a complete port input; first characterize a Guide-specific Discord mutation
port with message lookup and destination identity.

## Guide-specific Port Preparation Update (2026-08-08)

That characterization is complete as a contract-only slice. The next bounded
step is a production Application port interface plus test-adapter preparation;
legacy Discord mutation remains authoritative until a later integration slice.
