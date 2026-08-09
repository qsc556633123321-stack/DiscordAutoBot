# Community Roadmap Post-Migration Cleanup Candidates

| Candidate | Classification | Decision |
| --- | --- | --- |
| Roadmap direct `saveOnboarding` path | Already removed | No action. |
| Roadmap-specific filesystem repository/port | Absent | Do not add or clean up. |
| Historical preparation tests/docs | Needs preparation | Keep while they guard the staged migration history. |
| `saveOnboarding` helper | Do not remove | Guide runtime still calls it. |
| Existing generic persistence writer | Do not remove | Shared compatibility contract. |

This is an audit list only. No production cleanup is approved in Closure Slice #1.
