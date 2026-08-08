# Guide Discord Mutation Port Implementation Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Contract-only preparation | Complete | This slice |
| B. Production port interface + test adapter | Complete | Implemented without runtime wiring |
| C. Discord adapter without runtime redirect | Blocked | application lookup boundary must be implemented before Plan creation |
| D. Composition wiring without redirect | Needs more preparation | depends on production interface/adapter |
| E. Runtime redirect Edit only | Blocked | lookup/error mapping not frozen enough |
| F. Runtime redirect Send only | Blocked | destination/error mapping not frozen enough |
| G. Runtime redirect Edit + Send | Rejected now | broad mutation replacement |
| H. No implementation | No longer preferred | contract preparation is complete |

## Recommended Next Slice

The Application port interface and test adapter are complete. Infrastructure
Adapter Preparation and pre-Plan lookup preparation are complete as
characterization only. Approve only **a Guide Publication Application Lookup
Port plus test fake** next; add no production Discord adapter, composition
wiring, or runtime redirect.
