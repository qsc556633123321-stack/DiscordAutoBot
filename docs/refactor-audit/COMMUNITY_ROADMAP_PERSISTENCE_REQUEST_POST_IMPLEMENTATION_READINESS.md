# Roadmap Persistence Request: Post-Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Generic publication persistence reuse adapter preparation | Approved next |
| B. Runtime persistence redirect preparation | Deferred until A is characterized |
| C. Runtime persistence redirect implementation | Not approved |
| D. New Roadmap repository | Rejected |
| E. Async migration | Rejected for current compatibility |
| F. Keep legacy runtime | Current state |

The application request/mapper now exists, but it is not runtime-used. The
next slice may prepare a narrow reuse adapter/feature around the existing
generic composition boundary. It must not redirect `setupRoadmapPanel`.
