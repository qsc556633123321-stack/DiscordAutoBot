# Community Button Dispatch Implementation Source Audit

The active route is `src/events/interactionCreate.js` to
`src/modules/interactions/interactionGateway.js`, then
`buttonInteractionHandler.js`. The button router evaluates family handlers in
array order and calls `legacyInteractionDispatcher.execute` only when no family
matches.

Slice #84 adds the Concierge family at
`src/modules/interactions/buttonHandlers/communityConciergeButtons.js` and
registers it before that fallback. The family delegates to the existing
`handleConciergeButton` presentation runtime. The removed legacy branch was in
`src/legacy/interactions/legacyInteractionRuntime.js`; the global legacy
dispatcher remains unchanged for every other unmatched interaction.
