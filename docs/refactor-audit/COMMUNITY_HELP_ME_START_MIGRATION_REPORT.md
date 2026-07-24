# Community Help Me Start Migration Report

## Scope

`/help-me-start` is now a complete read-only vertical slice. The legacy command remains a thin wrapper and the legacy interactive-guide helper remains a compatibility consumer.

| Boundary | New location |
| --- | --- |
| Presentation | `src/presentation/commands/helpMeStartCommand.js`, `src/presentation/community/helpMeStartEmbed.js` |
| Application | `src/application/community/getHelpMeStartRecommendation.js` |
| Domain source of truth | `src/domain/community/helpMeStartRecommendation.js` |
| Ports | `application/community/ports/guildChannelReader.js`, `conciergeTextGenerator.js` |
| Infrastructure / legacy adapter | `infrastructure/community/discordGuildChannelReader.js`, `adapters/legacy/legacyConciergeTextGenerator.js` |
| Composition | `src/composition/community/helpMeStartFeature.js` |
| Compatibility | legacy command wrapper; `interactiveGuideSystem.buildHelpMeStartEmbed` delegates Composition only |

## Preserved contracts

- Slash metadata, option metadata/order/default mapping, deferred ephemeral reply, edit-reply payload shape, embed color/title/fields/footer, and Presentation-owned timestamp are regression-tested.
- Channel matching preserves guild cache order, text-only matching, `Set` mention dedupe, pattern behavior, maximum eight results per lookup, and the original unescaped game RegExp.
- AI kind is `help_me_start`; context is `{ guildName, answers, recommendation }`; fallback is unchanged.
- The optional AI adapter delegates to existing `communityConcierge.generateConciergeText`, preserving success, fallback, and existing error behavior without moving Concierge.

## Explicit exclusions

No role, channel, permission, message publication, JSON, database, onboarding, MemberGuard, Voice, Layout, Permission Repair, Panels, Proposals, Dashboard, or `.env` change was made.

## Tests and rollback

Domain, application, adapter, presentation, composition, vertical-slice, migration regression, registry/deploy, and architecture-boundary tests run through `test:community` / `test:migration`. Migration regression now compares active output with a frozen legacy baseline fixture rather than calling the compatibility helper. Rollback is one import reversion in the legacy wrapper; legacy helper remains available. The known invalid-RegExp input risk is preserved and recorded for a separate behavior-change decision.

## Status

The initial migration introduced two reverse-layer dependencies. This cleanup moved the Concierge bridge to `adapters/legacy` and removed the helper's direct Presentation dependency. The dependency analyzer now reports **100 / 100**, with zero circular and zero reverse-layer dependencies.

`/help-me-start`: **Migrated / Thin Wrapper Complete**. Community overall: **Migration In Progress**.
