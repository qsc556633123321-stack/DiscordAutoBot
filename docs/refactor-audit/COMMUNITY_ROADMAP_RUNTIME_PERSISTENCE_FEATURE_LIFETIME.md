# Community Roadmap Persistence Feature Lifetime

## Candidates

| Construction strategy | Decision |
| --- | --- |
| Module-level generic and Roadmap persistence features | Not decided in this slice |
| Per `setupRoadmapPanel` invocation | Not decided in this slice |
| Reuse an existing module-level generic feature | Not currently available in runtime |
| Introduce a higher composition root | Out of scope |

The future redirect must use `communityRoadmapPersistenceFeature` rather than
generic persistence internals. This preparation slice intentionally does not
choose construction lifetime because that choice is a production runtime diff.
