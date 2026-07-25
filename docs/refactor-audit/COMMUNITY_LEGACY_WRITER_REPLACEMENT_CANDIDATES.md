# Community Legacy Writer Replacement Candidates

| Candidate | Decision | Reason |
| --- | --- | --- |
| A Shared root read helper preparation | Needs more baseline | fallback semantics and all consumers must be frozen |
| B Shared root write helper characterization | Needs more baseline | writer swallows errors and rewrites full root |
| C Shared read-modify-write helper | Blocked | would alter stale-read/failure behavior |
| D Publication-only writer wrapper | Blocked | shares native onboarding and full root |
| E Unify all onboarding writers | Rejected this phase | changes active ownership and ordering |
| F Production CommunityPublicationStateStore adapter | Blocked | no production port approved |
| G Single-writer migration by consumer | Blocked | coexistence is unresolved |
| H Atomic writer preparation | Blocked | atomicity is a behavior change |

**No Writer Preparation Slice Approved.**
