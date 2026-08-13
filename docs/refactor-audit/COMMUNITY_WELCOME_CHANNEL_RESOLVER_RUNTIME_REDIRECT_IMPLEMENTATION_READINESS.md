# Community Welcome Channel Resolver Runtime Redirect Implementation Readiness

## Evidence
The production resolver and test-only redirect candidate preserve cache hit, cache miss, fetch success/failure, falsy fallback, malformed truthy IDs, object identity, no-channel early return, semantic request mapping, payload construction, direct DM swallowing, and one tracking read.

## Candidates
| Candidate | Decision |
| --- | --- |
| A. Resolver Runtime Redirect Implementation | Ready and recommended |
| B. DM Delivery Boundary Implementation | Not in scope |
| C. Resolver + DM Atomic Migration | Rejected: combines independent mutation ownership |
| D. Welcome Final Closure Implementation | Not ready: direct DM remains runtime-owned |
| E. Filesystem Cleanup | Not in scope |
| F. Keep Runtime | Safe fallback, but no longer necessary for channel resolution |

## Approved Next Production Scope
Only `src/systems/communityConcierge.js`: add the resolver import, construct it per invocation after tracking read, and replace the direct cache/fetch/name expression. Do not modify the resolver, tracking boundary, reader, filesystem, payload mapping, or DM delivery.
