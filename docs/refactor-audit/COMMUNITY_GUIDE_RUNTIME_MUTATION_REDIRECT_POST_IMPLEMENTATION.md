# Community Guide Runtime Mutation Redirect: Post-Implementation

`setupCommunityGuide()` now calls the per-invocation Adapter Pair's
`mutationPort.edit()` and `mutationPort.send()` for Guide publication only.
It resolves the exact Discord message through `getRetainedMessage()` before
the existing persistence step. The legacy direct Guide edit/send expressions
are absent from that function; Roadmap publication is explicitly unchanged.

The runtime throws the retained raw rejection whenever the Pair reports
`hasFailure`, including `undefined`. A result without a retained raw failure
throws an invariant error containing the operation and failure kind. No retry,
fallback mutation, extra fetch, or duplicate write was introduced.

Rollback: revert commit `fc48186` and its test-only follow-up for this slice.
