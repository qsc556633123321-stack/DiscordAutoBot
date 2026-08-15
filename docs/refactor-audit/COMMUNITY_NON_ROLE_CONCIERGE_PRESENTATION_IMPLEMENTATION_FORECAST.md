# Community Non-role Concierge Presentation Implementation Forecast

Approved future production additions: one presentation payload builder in `src/modules/community/` and its focused tests. Approved future production modification: only `src/systems/communityConcierge.js`, replacing the Night, Bot, and Roadmap payload literals while preserving existing surrounding ordering.

Forbidden in that implementation: prefix dispatcher, `communityConciergeButtons` error wrapper, semantic resolver, role feature/gateway, Guide/Roadmap/Welcome publication flows, filesystem/state readers, persistence, JSON data, dashboard, and `.env`.

The runtime will resolve Night links before invoking the builder, pass the existing roadmap builder for Roadmap, await exactly one reply, and continue returning `true`. Builder errors must propagate to the existing modern button error wrapper without a new catch.
