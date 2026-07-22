# Community About Migration Report

## Scope

This migration handles only `/community-about`. It does not change Roadmap, onboarding, guide setup, roles, panels, proposals, bootstrap, rebuild, maintenance, Layout, Permission Repair, Voice, MemberGuard, Memory, Organizer, Audit, Dashboard infrastructure, formal data, or `.env`.

## Vertical slice

| Layer | Path | Responsibility |
| --- | --- | --- |
| Domain | `src/domain/community/communityAbout.js` | Pure immutable source of static About facts plus guild-name normalization. |
| Application | `src/application/community/getCommunityAboutUseCase.js` | Read-only Result query through an injected port. |
| Port | `src/application/community/ports/communityAboutGateway.js` | Requires `getCommunityAboutFacts()` using plain input/output. |
| Infrastructure | `src/infrastructure/community/communityAboutGateway.js` | Maps the read-only guild-name fact; no Discord reply, Embed construction, or persistence. |
| Composition | `src/composition/communityAboutFeature.js` | Wires only the About gateway and use case; supports test injection. |
| Presentation | `src/presentation/commands/communityAboutCommand.js` | Retains command metadata, guild-name extraction, EmbedBuilder rendering, immediate ephemeral reply, and propagated failure behavior. |
| Legacy wrapper | `src/legacy/commands/community-about.js` | Direct presentation re-export; alias/deploy compatibility remains. |

## Compatibility results

- Source of truth: `domain/community/communityAbout.js`; the existing Concierge helper now renders those same facts for compatibility.
- Reply and embed compatibility: exact gateway JSON is rendered through `EmbedBuilder`; field order, color, title, description, timestamp, and ephemeral reply are regression-tested.
- Error compatibility: a failed Result is rethrown; no new user-visible fallback or logger was introduced.
- Registry/deploy compatibility: same alias name, same slash payload, same 72-command registry count.
- Legacy: retained as a thin wrapper and rollback-compatible alias entry.

## Tests and enforcement

- Real `test:community` covers domain, application, infrastructure gateway, composition, presentation, wrapper, registry/deploy payload, and migration regression.
- `test:migration` includes the Community About regression.
- `test:legacy-boundaries` now enforces the direct Community About wrapper and domain/application/presentation import boundaries.

## Rollback

Revert the alias override and restore the original legacy command body from Git. The previous shared `buildAboutEmbed` source was not modified, and no data migration exists.

## Final state

Community About: **Migrated / Thin Wrapper Complete**.

Community overall: **Migration In Progress**. The next recommended slice is the read-only Community Roadmap query; it must remain separate from onboarding/guide setup and JSON mutation.
