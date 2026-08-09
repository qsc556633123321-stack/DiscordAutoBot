# Community Roadmap Runtime Mutation Redirect Implementation Blockers

This slice does not migrate the persistence writer. `saveOnboarding` remains
legacy runtime-owned and preserves current JSON and writer-swallowed
partial-success behavior. No retry, rollback, fallback Discord mutation,
post-mutation fetch, direct Adapter import, or failure-getter use was added.

Further work must keep the current raw Message identity, payload identity,
single-mutation behavior, and exact rejection propagation covered by tests.
