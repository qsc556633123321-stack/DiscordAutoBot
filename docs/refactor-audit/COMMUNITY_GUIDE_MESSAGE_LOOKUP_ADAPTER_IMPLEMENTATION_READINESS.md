# Community Guide Message Lookup Adapter Implementation Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Infrastructure Lookup Adapter Preparation | Complete | This characterization slice |
| B. Additional Channel Resource Boundary Preparation | Complete | Resource lifecycle and continuity characterized |
| C. Composition Preparation | Needs more preparation | Requires an approved adapter dependency |
| D. Runtime Lookup Redirect | Blocked | Must preserve channel-resolution behavior |
| E. Mutation Adapter Implementation | Blocked | Depends on safe lookup integration |
| F. Combined Lookup + Mutation resource session | Blocked | Broad high-risk migration |
| G. No further integration | Rejected | Lookup port is implemented |

Production adapter implementation is not approved: scalar channel resolution
adds a failure/count/timing surface absent from legacy runtime. The next
candidate is Infrastructure Resource Session Preparation only.
