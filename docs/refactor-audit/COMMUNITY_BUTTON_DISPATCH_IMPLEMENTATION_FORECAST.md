# Community Button Dispatch Implementation Forecast

The smallest future implementation is a pure semantic resolver, for example
`CommunityConciergeButtonActionResolver`, that accepts only `customId` and
returns either a semantic action or `null`. It must not accept a Discord
interaction or produce reply payloads.

Expected production additions: one Application resolver and its tests.
Expected production modification: `src/systems/communityConcierge.js` only, to
consume a resolver result while preserving exact branch order, reply payloads,
and returns. `src/legacy/interactions/legacyInteractionRuntime.js` is forbidden
in the first implementation slice: it retains `concierge_` prefix matching and
the error wrapper. No Guide, Roadmap, Welcome, filesystem, role mutation,
adapter, persistence, JSON, or composition changes are approved.
