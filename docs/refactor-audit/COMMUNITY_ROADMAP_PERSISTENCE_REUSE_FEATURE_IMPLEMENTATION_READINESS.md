# Roadmap Reuse Feature: Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Production Roadmap reuse composition feature | Ready next |
| B. Runtime persistence redirect preparation | Ready after A |
| C. Runtime persistence redirect implementation | Not approved |
| D. New Roadmap repository | Rejected |
| E. Async persistence | Rejected |
| F. Keep legacy runtime | Current state |

The next feature must only inject the generic composition feature, map an
implemented Roadmap request, call `.execute` synchronously, and return the
generic result unchanged.
