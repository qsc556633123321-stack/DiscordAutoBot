# Community Mutation Migration Roadmap

1. **Phase 1 - preparation:** freeze Guide publish/refresh runtime fixtures and separate channel/message/state responsibilities on paper. No production migration yet.
2. **Phase 2 - isolated feature workflows:** consider Guide Publish only after explicit ports and partial-failure fixtures exist; Panels remain separate.
3. **Phase 3 - role/permission-sensitive flows:** role self-assignment, onboarding initial role, then permission repair.
4. **Phase 4 - shared orchestration:** proposal approval and bootstrap/rebuild after Game, Voice, Panel, Role, and Permission contracts stabilize.
5. **Phase 5 - destructive maintenance:** cleanup/delete work only after diagnostics, confirmations, and rollback evidence are independently tested.

Current next mutation slice: **none approved**. The most likely future candidate is Guide Publish/Refresh, currently blocked by the dependencies above.

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
