# Community StateReader JSON Migration Readiness

| Candidate | Result |
| --- | --- |
| A: Atomic StateReader + Runtime Migration | Recommended. Contract, construction, one-read, identity, failure, and ordering equivalence are frozen. |
| B: StateReader-only migration | Rejected: breaks all runtime construction sites. |
| C: Guide-only migration | Rejected: leaves dual contracts and inconsistent ownership. |
| D: Runtime filesystem cleanup first | Rejected: it depends on the atomic migration. |
| E: Composition | Rejected: no composition requirement exists. |
| F: Keep current | Not recommended. |

Progress remains 85% because this preparation moves no runtime ownership.
