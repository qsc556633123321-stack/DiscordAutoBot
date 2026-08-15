# Community Button Dispatch Implementation Shape

Approved production scope:

- `src/modules/interactions/buttonHandlers/communityConciergeButtons.js`
- `src/modules/interactions/buttonInteractionHandler.js`
- `src/legacy/interactions/legacyInteractionRuntime.js` (remove Concierge-only
  import and branch)

The new handler uses the established `matches(customId)` / `handle(interaction)`
family API. `handle` awaits and ignores `handleConciergeButton`'s return value,
preserves the legacy console error message, and sends the same ephemeral
fallback only before a reply or defer. It does not own presentation, role
workflow, exact-ID resolution, persistence, or other interaction families.
