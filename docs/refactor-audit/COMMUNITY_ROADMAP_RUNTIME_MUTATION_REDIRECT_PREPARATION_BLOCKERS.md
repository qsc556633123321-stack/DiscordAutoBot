# Community Roadmap Runtime Mutation Redirect Preparation Blockers

This preparation leaves production runtime legacy-owned. A redirect implementation
must preserve exact `M`/`S` identity, raw rejection identity including
`undefined`, payload object identity, mutation-before-persistence ordering,
writer-swallowed partial success, zero extra Discord I/O, and no retry,
rollback, direct fallback, or second send.

The dedicated redirect tests also make retained-message absence or ID mismatch
an invariant failure before persistence. Architecture health must remain 100,
with zero circular and reverse-layer dependencies.
