# Guide Runtime Persistence Redirect: Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Redirect only | Ready with explicit exclusions |
| B. More preparation | Not required |
| C. Redirect plus `saveOnboarding` cleanup | Rejected |
| D. Split native persistence | Rejected |
| E. Async migration | Rejected |
| F. Keep legacy | Not selected |

The redirect may replace only final Guide `saveOnboarding` after final Message
identity with per-invocation generic and Guide feature creation, one semantic
request, and one synchronous `persist`. It must ignore `{ persisted, record }`
and preserve writer-swallowed partial success and raw invariant throws.
