# Guide Adapter Pair Post-Implementation Readiness

Resource Session, Lookup Adapter, and Mutation Adapter are production
infrastructure components, all implemented and not wired. Candidate A,
per-invocation adapter-pair composition preparation, is Ready with explicit
exclusions. Candidate B, composition implementation without runtime redirect,
needs that preparation. Runtime session creation, lookup redirect, mutation
redirect, and full Guide migration remain Blocked. Keeping legacy runtime is
Rejected as the next migration action because it does not reduce ownership.
