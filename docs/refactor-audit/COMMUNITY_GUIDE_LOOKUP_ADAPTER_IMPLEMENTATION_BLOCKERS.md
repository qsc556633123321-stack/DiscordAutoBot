# Guide Lookup Adapter Implementation Blockers

The Lookup Adapter is implemented but not wired. This slice does not approve a
Mutation Adapter, composition feature, runtime lookup redirect, runtime session
creation/injection, resolver, registry, singleton, retry, repair, or
normalization. The adapter depends only on its explicitly injected session.
