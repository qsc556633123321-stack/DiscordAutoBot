# Community Publication Tracking Read Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Shared Tracking Read Application Port Implementation | Required component, but pair it with the adapter for a complete isolated boundary. |
| B. Shared Tracking Read Compatibility Adapter Implementation | Required component, paired with A. |
| C. Shared Tracking Read Composition Feature Implementation | Deferred; no runtime redirect in the next slice. |
| D. Guide + Roadmap Runtime Redirect Preparation | Deferred until the port and adapter exist. |
| E. Guide Runtime Redirect Directly | Rejected. |
| F. Keep Legacy | Rejected. |

## Recommended Next Slice

**Shared Tracking Read Boundary Implementation:** add only the Application port contract and the infrastructure compatibility adapter, with explicit allowlist limited to new `src/application/community/ports/**`, `src/infrastructure/community/**`, tests, composition-free documentation, and `docs/REFACTOR_STATUS.md`. Do not modify `communityConcierge.js`, Guide, Roadmap, or welcome runtime in that slice.
