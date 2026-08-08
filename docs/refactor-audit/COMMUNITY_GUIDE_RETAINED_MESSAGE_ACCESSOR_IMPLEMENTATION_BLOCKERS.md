# Retained Message Accessor Implementation Blockers

The accessor is Session-local only. It is not exposed by Pair, Composition, Lookup Adapter, Application, or Runtime. Runtime lookup redirect, mutation redirect, second fetch, global cache/registry, take/consume semantics, retry, repair, and normalization remain excluded.
