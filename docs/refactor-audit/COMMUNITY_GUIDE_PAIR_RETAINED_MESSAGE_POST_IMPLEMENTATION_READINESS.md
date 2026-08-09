# Community Guide Pair Retained Message Post-Implementation Readiness

## Implemented
`createGuidePublicationAdapterPair()` now returns
`{ lookupPort, mutationPort, getRetainedMessage }`. The getter is a narrow,
synchronous delegate to its private Session.

## Explicit Exclusions
Runtime lookup and mutation remain legacy-owned. Composition, Application,
persistence, Roadmap, adapters, and Resource Session are unchanged by this
slice.

## Next Candidates
1. **Ready with explicit exclusions:** refresh runtime lookup redirect
   preparation against the public Pair capability.
2. **Blocked:** runtime lookup redirect, pending that refreshed preparation.
3. **Blocked:** mutation redirect preparation.
4. **Blocked:** full Guide Discord runtime migration.
5. **Rejected for now:** keep legacy indefinitely.
