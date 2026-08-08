# Community Mutation Migration Roadmap

1. **Phase 1 - preparation:** freeze Guide publish/refresh runtime fixtures and separate channel/message/state responsibilities on paper. No production migration yet.
2. **Phase 2 - isolated feature workflows:** consider Guide Publish only after explicit ports and partial-failure fixtures exist; Panels remain separate.
3. **Phase 3 - role/permission-sensitive flows:** role self-assignment, onboarding initial role, then permission repair.
4. **Phase 4 - shared orchestration:** proposal approval and bootstrap/rebuild after Game, Voice, Panel, Role, and Permission contracts stabilize.
5. **Phase 5 - destructive maintenance:** cleanup/delete work only after diagnostics, confirmations, and rollback evidence are independently tested.

Current next mutation slice: **none approved**. The most likely future candidate is Guide Publish/Refresh, currently blocked by the dependencies above.

## Guide-specific Discord Mutation Port Preparation (2026-08-08)

The Guide-specific Port contract is now prepared with scalar identity, lookup
ownership, result/failure semantics, and 30 frozen compatibility cases. This
does not migrate Discord execution. The next bounded candidate is a production
Application port interface plus test-adapter preparation only.

## Guide Discord Mutation Application Port (2026-08-08)

The Application Port interface and test fake are complete and not wired. The
next possible preparation slice is the Guide-specific infrastructure adapter
boundary; no adapter implementation or runtime redirect is approved.

## Community Guide Mutation Baseline (2026-07-25)

Guide mutation characterization is complete for the active setup/refresh
commands and their Guide/Roadmap publication coupling. No production mutation
was migrated, no wrapper was changed, and **no mutation slice is approved**.
Community remains **Migration In Progress**; Guide setup/status remains
**Dead / No Consumer / Not Migrated** for migration-status purposes.

The Shared Persistence Contract is complete as baseline evidence only. No
persistence repository, port, or mutation slice has been migrated.

The Publication Identity Contract is complete as baseline evidence only; no
identity resolver, duplicate detector, or recovery path is migrated.

Guide Existing Publication State Read is complete as Runtime Integration Slice
#1. Mutation, persistence, writer, Bootstrap, and Rebuild migrations remain
blocked.

Roadmap Existing Publication State Read is complete as Runtime Integration
Slice #2. Shared read consolidation and all write-side migrations remain blocked.

Guide channel lookup characterization is complete, but it approves no runtime
integration: lookup is coupled to member-DM publishing and legacy fallback
behavior. The next status remains **No Channel Lookup Runtime Integration Slice
Approved**.

Welcome Delivery Preparation is complete as a pure application contract only.
It does not approve a Discord delivery port, adapter, or `sendConciergeWelcome`
migration.

The mapper-plus-builder payload integration is now complete. Delivery result,
failure reasons, ports, adapters, and full welcome migration remain unapproved.

## Welcome Delivery Result Characterization (2026-08-01)

Complete as baseline evidence only. No Result/Failure Reason runtime integration
or full Welcome Delivery migration is approved.

## Guide Publication Mutation Plan Preparation (2026-08-01)

Complete as a pure plan artifact. Guide publication mutation remains unintegrated.

## Guide Publication Mutation Execution Characterization (2026-08-08)

Complete as baseline evidence only. Message execution and persistence remain
legacy-owned and unintegrated.

## Guide Publication Mutation Runtime Integration Preparation (2026-08-08)

Complete. Plan-controlled branch integration is future-ready with explicit
exclusions; no runtime migration occurred.

## Guide Publication Mutation Plan Branch Runtime Integration (2026-08-08)

Complete. The Plan now controls the active Guide Edit/Send decision only.
Discord execution, persistence, and Roadmap behavior are not migrated.

## Post-Persistence Reassessment (2026-08-08)

The shared publication persistence writer/repository is now migrated while its
legacy synchronous full-root behavior is preserved. Guide Discord execution
and Roadmap continuation remain legacy-owned. `GuidePublicationExecutionRequest`
is prepared but is not integrated into runtime; the next preparation boundary
is a Guide-specific Discord mutation port.

## Guide Infrastructure Adapter Preparation (2026-08-08)

Preparation is complete with 40 frozen cases. Production adapter work is not
approved because pre-Plan lookup failure selects Send in legacy runtime but is
not expressible from the post-Plan Edit request alone.

## Guide Pre-Plan Lookup Preparation (2026-08-08)

The legacy lookup state and Plan mapping are frozen. The next bounded step is
an Application Lookup Port plus test fake; no production lookup adapter,
mutation adapter, composition wiring, or runtime redirect is approved.
