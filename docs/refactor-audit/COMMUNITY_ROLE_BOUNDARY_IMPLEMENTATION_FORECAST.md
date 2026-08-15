# Community Role Boundary Implementation Forecast

Proposed production allowlist for a later implementation:

- `src/application/community/...` for one quick-action use case and request/result
- `src/infrastructure/discord/...` for one Community role mutation adapter
- one narrowly scoped composition factory if the existing convention requires it
- `src/systems/communityConcierge.js` only for wrapper delegation

Explicitly forbidden in that slice: button dispatcher modules, commands,
permission templates, role configuration, layout/community rebuild flows,
filesystem, persistence, dashboard, and Guide/Roadmap/Welcome boundaries.
