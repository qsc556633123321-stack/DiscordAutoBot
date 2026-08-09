# Community Guide Persistence Reuse: Implementation Necessity

**Result: Production Guide thin Composition Feature REQUIRED.**

The future Guide runtime should remain semantic: it creates a Guide persistence
request, not a generic `{ guildId, patch }` persistence input. A thin
Composition feature preserves that boundary while reusing the already-approved
generic writer path.

The feature is not a writer, repository, persistence Port, Discord adapter, or
filesystem adapter. It must not add validation, timestamps, retries, logging,
schema ownership, or Roadmap semantics.
