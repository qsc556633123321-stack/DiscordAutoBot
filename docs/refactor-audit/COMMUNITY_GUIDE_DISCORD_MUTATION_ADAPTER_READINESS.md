# Guide Discord Mutation Adapter Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Infrastructure adapter preparation | Complete | Lookup and failure mapping characterized; no adapter added |
| B. Infrastructure adapter implementation, not wired | Blocked | requires the lookup boundary to be implemented before Plan creation |
| C. Composition wiring | Blocked | depends on a safe adapter seam |
| D. Edit runtime redirect | Blocked | must preserve lookup/error behavior |
| E. Send runtime redirect | Blocked | must preserve destination/error behavior |
| F. Edit + Send runtime redirect | Rejected now | broad high-risk replacement |
| G. No further integration | Rejected | Application port is now implemented |

Pre-Plan lookup preparation is complete. The next recommended slice is a
**Guide Publication Application Lookup Port plus test fake**, not an adapter
implementation or runtime redirect.
