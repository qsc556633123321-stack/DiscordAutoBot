# Community Roadmap Adapter Pair Implementation Readiness

## Candidate A: Production Roadmap Adapter Pair, not wired

**Approved next slice.** The contract is frozen with one Session, one Lookup
Adapter, a narrow retained-message getter, zero construction/getter I/O, exact
message identity, and per-pair isolation.

## Later candidates

| Candidate | Status |
| --- | --- |
| B. Roadmap composition preparation | Not approved in this slice |
| C. Roadmap runtime pair creation preparation | Not approved in this slice |
| D. Roadmap runtime lookup redirect preparation | Not approved in this slice |
| E. Roadmap mutation preparation | Not approved in this slice |
| F. Keep legacy | Current runtime state only |

Production implementation of Candidate A must remain isolated: no composition,
no runtime pair creation, no lookup redirect, and no mutation surface.
