# Interaction Fallback Matrix

Generated: 2026-07-22T14:59:17.964Z

| Interaction family | Known custom ID family | New handler | Legacy fallback | Coverage conclusion |
| --- | --- | --- | --- | --- |
| button: role | roleperm_*, guest_cleanup_* | src/modules/interactions/buttonHandlers/roleButtons.js | yes: calls legacyInteractionRuntime.execute() | legacy runtime owns behavior |
| button: game | game_suggest_*, game_registry_doctor_* | buttonHandlers/gameButtons.js | yes: calls legacyInteractionRuntime.execute() | legacy runtime owns behavior |
| button: voice | tempvoice_*, lfg_* | buttonHandlers/voiceButtons.js | yes: calls legacyInteractionRuntime.execute() | legacy runtime owns behavior |
| button: panel | panel_* | buttonHandlers/panelButtons.js | yes: calls legacyInteractionRuntime.execute() | legacy runtime owns behavior |
| button: admin | ticket actions, rebuild/cleanup/layout prefixes | buttonHandlers/adminButtons.js | yes: calls legacyInteractionRuntime.execute() | legacy runtime owns behavior |
| button: unmatched | any other customId | buttonInteractionHandler.js | yes: legacyInteractionDispatcher.execute() | dynamic/unknown custom ID family |
| modal | all modal custom IDs | modalInteractionHandler.js | yes: direct dispatcher call | complete legacy coverage |
| string select | all select custom IDs | selectMenuInteractionHandler.js | yes: direct dispatcher call | complete legacy coverage |
| autocomplete | all autocomplete commands | autocompleteInteractionHandler.js | yes: direct dispatcher call | complete legacy coverage |

## Evidence and Limitation

- `buttonInteractionHandler.js` chooses a family matcher, then falls back to `legacyInteractionDispatcher.execute()` if no family matches.
- Each current button family imports `legacyInteractionRuntime` directly and delegates `handle()`, so the family split is routing-only today.
- Modal, select-menu, and autocomplete handlers delegate directly to the legacy dispatcher.
- The dispatcher logs `[LegacyFallback]` only when reached through its `execute()` wrapper. Direct calls to `legacyInteractionRuntime` do not produce equivalent fallback telemetry. Add targeted telemetry only during a later migration wave.