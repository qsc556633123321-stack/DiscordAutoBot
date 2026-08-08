# Guide Discord Mutation Port Implementation Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Contract-only preparation | Complete | This slice |
| B. Production port interface only | Ready with explicit exclusions | May be the next small slice |
| C. Discord adapter without runtime redirect | Needs more preparation | needs adapter failure characterization |
| D. Composition wiring without redirect | Needs more preparation | depends on production interface/adapter |
| E. Runtime redirect Edit only | Blocked | lookup/error mapping not frozen enough |
| F. Runtime redirect Send only | Blocked | destination/error mapping not frozen enough |
| G. Runtime redirect Edit + Send | Rejected now | broad mutation replacement |
| H. No implementation | No longer preferred | contract preparation is complete |

## Recommended Next Slice

Approve **Production Guide-specific Port Interface + test-adapter preparation**
only. It must add no Discord adapter, composition wiring, or runtime redirect.
Its purpose is to turn this frozen candidate contract into an architecture-owned
Application port while keeping legacy execution authoritative.
