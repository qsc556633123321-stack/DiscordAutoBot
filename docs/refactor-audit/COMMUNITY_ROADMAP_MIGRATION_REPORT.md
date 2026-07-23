# Community Roadmap Migration Report

## Scope

Only the read-only `/community-roadmap` command was migrated. Community About, onboarding, guide setup, roles, bootstrap/rebuild, panels, proposals, maintenance, Layout, Permission Repair, Voice, MemberGuard, Memory, Organizer, Audit, Dashboard infrastructure/editor, `.env`, the production roadmap JSON, and all Roadmap writers remain unchanged.

## Slice

| Layer | Path | Responsibility |
| --- | --- | --- |
| Domain | `src/domain/community/communityRoadmap.js` | Pure schema validation, normalization, grouping, and ordering required by the renderer. |
| Application | `src/application/community/getCommunityRoadmapUseCase.js` | Read query returning core `Result`. |
| Port | `src/application/community/ports/communityRoadmapGateway.js` | Read-only `getCommunityRoadmap()` contract. |
| Infrastructure | `src/infrastructure/community/communityRoadmapGateway.js` | UTF-8 JSON read, source-path resolution, and existing fallback behavior; no writes or Discord. |
| Composition | `src/composition/communityRoadmapFeature.js` | Wires gateway to use case with injection support. |
| Presentation | `src/presentation/commands/communityRoadmapCommand.js` plus `src/modules/community/communityRoadmapEmbed.js` | Preserves slash metadata, immediate ephemeral reply, fixed embed content, footer, and timestamp. |
| Legacy | `src/legacy/commands/community-roadmap.js` | Direct presentation re-export. |

## Compatibility and rollback

- Static payload, field order, inline flags, footer, color, empty-state text, and ephemeral behavior are regression-tested.
- Timestamp is added only by the Presentation renderer and asserted as ISO; dynamic timestamps are not directly compared.
- The retained Concierge helper is a compatibility consumer and rollback reference; the active slash command does not import it.
- `src/data/community-roadmap.json` is the formal editable source during normal operation. `DEFAULT_COMMUNITY_ROADMAP` is a legacy compatibility fallback snapshot moved from the Concierge reader, not a second editable source. It can drift from the JSON file; changing that fallback contract requires a separate data-contract migration.
- Revert this commit to restore the prior legacy command body and Concierge reader implementation. No data migration or write occurred.

## Result

Community Roadmap: **Migrated / Thin Wrapper Complete**.

Community overall: **Migration In Progress**. The next candidate remains a separate read-only onboarding/guide query, not setup or mutation.
