# Community Concierge Button Resolver Implementation Forecast

Approved next implementation allowlist:

1. `src/application/community/CommunityConciergeButtonActionResolver.js`
2. `src/systems/communityConcierge.js`

The runtime change may replace direct exact-ID selection with the resolver but
must preserve branch ordering, role feature calls, quick-link calls, embeds,
reply payloads, and `true`/`false` returns. The following remain forbidden:
legacy interaction runtime, role use case/gateway, dispatcher modules,
composition, infrastructure, persistence, JSON, Guide, Roadmap, Welcome, and
filesystem files.
