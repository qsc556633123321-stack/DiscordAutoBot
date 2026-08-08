# Guide Discord Mutation Application Port Blockers

Base: `9f8ef87`.

The Application port interface and test adapter are approved in this slice.
They do not authorize a Discord adapter or runtime redirect.

## Remaining Blockers

1. Lookup timing/count and malformed identity mapping must be characterized at
   the future infrastructure adapter boundary.
2. Legacy runtime propagates edit/send errors, while the port has a scalar
   failure vocabulary; a future caller mapping must preserve observables.
3. Channel ensure, Guide publication, persistence, and Roadmap continuation
   remain one legacy workflow with partial-failure ordering.
4. No composition seam exists until an adapter can be introduced without
   redirecting runtime.

## Explicitly Not Changed

`communityConcierge`, persistence, Roadmap, JSON, Discord API calls, and
Execution Request are unchanged.
