# Guide Adapter Pair Composition Feature Implementation Blockers

The production Composition Feature now exists, but is deliberately unwired.
It exposes the Pair Factory through dependency injection and does not create a
pair until a caller invokes `createAdapterPair`.

Runtime integration remains blocked on frozen legacy behavior for failure
handoff, persistence ordering, Roadmap continuation, and rollback. Runtime
lookup and mutation continue to use `communityConcierge.js` directly.
