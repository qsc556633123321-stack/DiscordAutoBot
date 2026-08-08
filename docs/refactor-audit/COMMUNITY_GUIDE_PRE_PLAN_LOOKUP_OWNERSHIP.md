# Community Guide Pre-Plan Lookup Ownership

| Candidate owner | Decision |
| --- | --- |
| A. Legacy runtime (`setupCommunityGuide`) | Current authoritative owner |
| B. Application lookup port plus infrastructure adapter | Future target boundary |
| C. Discord mutation adapter performs lookup | Rejected: too late to choose Send |
| D. Plan builder performs lookup | Rejected: Plan builder stays pure |

The mutation adapter may execute an already selected Edit or Send operation; it
must not perform a defensive selection lookup that changes the legacy branch.
