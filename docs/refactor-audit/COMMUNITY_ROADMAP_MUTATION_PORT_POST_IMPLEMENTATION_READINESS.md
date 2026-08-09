# Community Roadmap Mutation Port Post-implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Resource Session mutation extension preparation | Ready and recommended |
| B. Mutation Adapter preparation | Deferred |
| C. Pair mutation surface preparation | Deferred |
| D. Runtime mutation redirect preparation | Not approved |
| E. Failure handoff preparation | Required before redirect |
| F. Keep legacy mutation | Current runtime behavior |

The next slice must prepare Session mutation semantics only: Edit against the
same retained `M`, Send through the same ensured channel retaining exact `S`,
and exact raw rejection handoff. Persistence remains outside that boundary.
