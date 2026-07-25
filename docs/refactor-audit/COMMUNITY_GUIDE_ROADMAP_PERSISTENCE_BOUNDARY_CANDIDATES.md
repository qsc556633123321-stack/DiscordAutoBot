# Community Guide/Roadmap Persistence Boundary Candidates

| Candidate | Scope | Benefit | Risk / compatibility | Decision |
| --- | --- | --- | --- | --- |
| A. Guide record port | Guide fields only | narrow read/write ownership | native fields and shared root still coupled | Rejected for now |
| B. Roadmap record port | Roadmap fields only | narrow ownership | same shared root / duplicate risk | Rejected for now |
| C. Shared publication-state port | Guide, Roadmap, native fields | matches observed shared record | requires complete preservation/concurrency contract | Needs more baseline |
| D. Full onboarding-flow repository | entire file | faithful root preservation | very broad unknown-field blast radius | Blocked |
| E. Field-level patch writer | supplied patch only | could reduce lost updates | changes write semantics and atomicity expectations | Rejected for now |

No candidate becomes a Domain Aggregate merely because it is stored in one JSON
file. A future boundary must preserve all unknown fields, define concurrent
behavior, and keep legacy fallback behavior before it can replace production
reads/writes.
