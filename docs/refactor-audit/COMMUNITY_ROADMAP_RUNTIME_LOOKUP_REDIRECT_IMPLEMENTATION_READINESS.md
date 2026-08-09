# Roadmap Runtime Lookup Redirect Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Runtime lookup redirect only | Ready with explicit exclusions |
| B. More lookup preparation | Not needed |
| C. Roadmap mutation preparation | Deferred |
| D. Lookup and mutation together | Rejected: too broad |
| E. Keep legacy lookup | Safe but not the recommended next slice |

Candidate A is ready because characterization proves falsy skip, one truthy
fetch, rejection swallowing, falsy fetch-result mapping, exact message
identity, and no second fetch. It remains a one-file rollback while Edit/Send,
persistence, and return behavior remain unchanged.
