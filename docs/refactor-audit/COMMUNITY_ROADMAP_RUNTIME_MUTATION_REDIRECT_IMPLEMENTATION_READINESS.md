# Community Roadmap Runtime Mutation Redirect Implementation Readiness

## Approved next slice

Candidate A, **Runtime Mutation Redirect Only**, is ready. It may destructure
the existing `mutationPort` from the existing Pair, redirect Edit and Send, and
recover raw `S` through the existing retained-message accessor.

## Explicit exclusions

The next slice must not migrate persistence, change writer swallowing, add
retry/rollback/fallback behavior, add a failure getter, import an Adapter
directly, alter Pair/Composition/Session/Port surfaces, change lookup, or
alter return shape. Candidate B (additional mutation preparation), Candidate C
(persistence migration), Candidate D (combined mutation/persistence), and
Candidate E (new failure handoff) are not approved by this preparation slice.
