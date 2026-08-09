# Community Guide Pair Retained Message Handoff Preparation Blockers

## Status
Preparation complete; production handoff is not implemented.

## Blockers
- The production Pair Factory only exposes `lookupPort` and `mutationPort`.
- The legacy runtime still performs its own tracked-message fetch and must not be redirected in this slice.
- The exact Discord `Message` is infrastructure-local state and cannot enter Application or Composition state.
- Any runtime integration must preserve force, malformed-id, unavailable, ordering, and Roadmap continuation behavior.

## Approved Next Boundary
Implement only a narrow Pair-level synchronous delegate after a separate implementation decision.
