# Roadmap Persistence Request: Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Pure Roadmap application request contract implementation | Approved next |
| B. Generic feature reuse adapter preparation | Deferred until A is covered |
| C. Runtime persistence redirect preparation | Deferred |
| D. New repository | Rejected: duplicate writer risk |
| E. Direct migration | Not approved |
| F. Keep legacy | Temporary current state |

Candidate A is deliberately small: implement only a pure request/value object
and a mapper to the existing generic input, with no runtime, filesystem,
composition, or schema change.
