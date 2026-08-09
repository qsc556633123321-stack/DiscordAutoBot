# Community Roadmap Persistence Migration Preparation Blockers

1. Runtime still owns mutation-first, synchronous-save, return-last ordering.
2. Generic persistence is shared with Guide/onboarding; a second writer would duplicate it.
3. Real concurrent interleaving is not characterized; only sequential behavior is frozen.
4. `ensureFile` setup failure lies outside the writer-swallow baseline.
5. Future work must preserve exact IDs, schema, no retry/rollback, and partial success.
6. This slice changes no production source, adapter, Port, composition, JSON, or runtime.
