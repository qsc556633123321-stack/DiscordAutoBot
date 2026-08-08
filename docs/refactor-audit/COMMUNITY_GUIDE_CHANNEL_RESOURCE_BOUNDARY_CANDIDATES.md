# Community Guide Channel Resource Boundary Candidates

| Candidate | Status | Rationale |
| --- | --- | --- |
| A. Keep ensured channel legacy-owned | Ready | Preserves current behavior |
| B. Opaque resource handle | Needs more preparation | IDs alone imply re-resolution |
| C. Infrastructure-local `GuideChannelSession` | Ready with explicit exclusions | Preparation candidate only |
| D. ChannelResourcePort | Needs more preparation | Ensure policy is high-risk |
| E. Independent lookup/mutation re-resolution | Blocked | extra calls and failures |
| F. Pass Discord channel through Application | Rejected | layer leakage |
