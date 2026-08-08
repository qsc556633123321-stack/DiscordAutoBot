# Community Guide Publication Mutation Plan Runtime Readiness

| Candidate | Status | Reason |
| --- | --- | --- |
| A. Pure plan builder only | Complete | immutable, deterministic application artifact with no runtime consumer |
| B. Shadow plan computation | Needs more preparation | requires a defined observation sink without changing errors/logging |
| C. Plan controls edit/send | Blocked | lookup, payload, Discord message calls, and persistence remain coupled |
| D. Plan plus Discord message port | Blocked | no port/adapter boundary approved |
| E. Plan plus persistence integration | Blocked | shared whole-root writer remains a compatibility contract |
| F. Full Guide publication mutation migration | Blocked | channel ensure, permissions, publication, and persistence are one legacy workflow |

The first recommended future work is Candidate B only if a separate shadow-observation contract is approved. **No Runtime Integration Approved** in this slice.

Runtime Integration Preparation supersedes the shadow recommendation: Candidate
D may be reviewed later with explicit legacy execution/persistence exclusions.
