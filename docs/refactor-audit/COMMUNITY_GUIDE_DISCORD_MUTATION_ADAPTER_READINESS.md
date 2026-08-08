# Guide Discord Mutation Adapter Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Infrastructure adapter preparation | Ready | Next possible slice: characterize lookup and failure mapping only |
| B. Infrastructure adapter implementation, not wired | Needs more preparation | requires adapter-level behavior fixtures |
| C. Composition wiring | Blocked | depends on a safe adapter seam |
| D. Edit runtime redirect | Blocked | must preserve lookup/error behavior |
| E. Send runtime redirect | Blocked | must preserve destination/error behavior |
| F. Edit + Send runtime redirect | Rejected now | broad high-risk replacement |
| G. No further integration | Rejected | Application port is now implemented |

The next recommended slice is **Infrastructure Adapter Preparation**, not an
adapter implementation or runtime redirect.
