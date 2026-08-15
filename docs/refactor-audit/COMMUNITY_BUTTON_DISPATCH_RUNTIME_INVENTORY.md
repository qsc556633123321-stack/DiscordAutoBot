# Community Button Dispatch Runtime Inventory

## Active entry

`src/events/interactionCreate.js` delegates to `interactionGateway`, which sends
button interactions to `buttonInteractionHandler`. No current family handler
matches `concierge_*`; the unmatched fallback calls
`legacyInteractionDispatcher.execute()`, which logs its fallback warning and
delegates to `legacyInteractionRuntime.execute()`.

The sole active Concierge prefix owner is
`src/legacy/interactions/legacyInteractionRuntime.js`. Its exact matcher is
`interaction.customId.startsWith('concierge_')`. It awaits
`handleConciergeButton(interaction)` from `src/systems/communityConcierge.js`.

| Entry | Trigger | Matcher | Downstream | Dispatcher return |
| --- | --- | --- | --- | --- |
| `legacyInteractionRuntime.execute` | button interaction | `startsWith('concierge_')` | `handleConciergeButton` | `undefined` after its branch `return` |

The handler return value is intentionally ignored by the legacy dispatcher.
This includes `false` for an unknown `concierge_*` customId.
