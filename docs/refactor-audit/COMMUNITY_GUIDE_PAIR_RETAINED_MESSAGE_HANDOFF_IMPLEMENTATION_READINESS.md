# Community Guide Pair Retained Message Handoff Implementation Readiness

## Decision
Production Pair Handoff Not Implemented.

## Evidence Ready
- Session accessor exists and is synchronous.
- Test-only Candidate A proves a narrow Pair delegate preserves exact identity without a second fetch.
- Fresh, unavailable, repeated lookup, and isolation invariants are frozen.
- Production Pair, Composition, Application, persistence, and runtime remain untouched.

## Sequenced Candidates
1. **Candidate A: Ready with explicit exclusions.** Implement only
   `getRetainedMessage()` in the production Pair Factory; no runtime usage.
2. **Candidate B: Needs refreshed preparation.** Reassess the runtime lookup
   redirect with the newly public Pair capability.
3. **Candidate C: Blocked.** Redirect runtime lookup only after Candidate B.
4. **Candidate D: Blocked.** Mutation redirect preparation remains separate.
5. **Candidate E: Blocked.** Full lookup/mutation migration needs both paths.
6. **Candidate F: Rejected for now.** Keeping legacy lookup leaves the handoff
   unused and does not reduce legacy ownership.

## First Approved Future Slice
Implement `getRetainedMessage()` only in `GuidePublicationAdapterPairFactory`,
with no runtime lookup redirect. Require the same regression and boundary guards
before considering runtime use.
