# Community Remaining Migration Risk Matrix

Scores use 1 (low) through 5 (critical). `Overall` is a risk judgment, not an arithmetic authorization.

| Slice | Read | Discord Mutation | Data | Permission | Cross-feature | Test Gap | Rollback | Overall | Recommendation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Help-me-start recommendation | 2 | 1 | 1 | 1 | 1 | 3 | 1 | 2 | Recommended Now |
| Guide renderer | 1 | 1 | 1 | 1 | 1 | 3 | 1 | 2 | Recommended After Read Slices |
| Read Concierge buttons | 2 | 1 | 1 | 1 | 2 | 3 | 1 | 2 | Recommended After Read Slices |
| Guide status | 3 | 1 | 1 | 2 | 2 | 4 | 1 | 3 | Recommended After Read Slices |
| Guide publish / refresh | 3 | 4 | 4 | 5 | 3 | 5 | 4 | 5 | Blocked by Permission Repair |
| Concierge role grant | 2 | 4 | 1 | 4 | 4 | 5 | 3 | 5 | Blocked by MemberGuard Boundary |
| Role selection / inheritance | 3 | 5 | 2 | 5 | 5 | 5 | 4 | 5 | Blocked by MemberGuard Boundary |
| Role settings | 2 | 1 | 4 | 3 | 3 | 4 | 2 | 3 | Recommended After Read Slices |
| Guest cleanup | 4 | 5 | 1 | 4 | 5 | 5 | 4 | 5 | Blocked by MemberGuard Boundary |
| Onboarding event steps | 4 | 4 | 2 | 4 | 5 | 5 | 4 | 5 | Blocked by MemberGuard Boundary |
| Panel render | 2 | 1 | 1 | 1 | 3 | 4 | 1 | 2 | Recommended After Read Slices |
| Panel publish | 3 | 5 | 4 | 3 | 5 | 5 | 4 | 5 | Defer |
| Proposal submit/review | 3 | 4 | 4 | 3 | 4 | 5 | 3 | 5 | Separate Feature Candidate |
| Proposal approval | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | Blocked by Voice |
| Bootstrap plan | 4 | 1 | 3 | 4 | 5 | 5 | 2 | 4 | Blocked by Layout |
| Bootstrap/rebuild execute | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | Blocked by Layout |
| Architect diagnose/execute | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | Blocked by Layout |
| Factory reset | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | Defer |

No Dead or Removal Candidate is established within this active Community surface. Dynamic command/event loading and compatibility fallback make static removal unsafe.
