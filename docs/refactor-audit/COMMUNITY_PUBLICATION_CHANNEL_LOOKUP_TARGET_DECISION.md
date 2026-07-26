# Community Publication Channel Lookup Target Decision

| Candidate | Runtime certainty | Isolation | Coupling / risk | Decision |
| --- | --- | --- | --- | --- |
| A. `sendConciergeWelcome` Guide lookup | Confirmed active | Lookup branches are identifiable but lead directly to DM | Discord lookup and DM send are in one function; no writer | Selected for characterization only |
| B. `setupCommunityGuide` lookup | Confirmed | Not isolated | category/channel ensure, overwrite, message publish, persistence | Rejected: Too Broad |
| C. Guide creation + lookup | Confirmed | None | mutation, permissions, persistence | Rejected |
| D. Roadmap channel lookup | No active consumer | n/a | no runtime evidence | Rejected |
| E. Bootstrap-triggered lookup | Indirect only | None | broad orchestration | Rejected |
| F. Rebuild V3-triggered lookup | Indirect only | None | broad orchestration | Rejected |
| G. Full Community lookup | Mixed | None | cross-feature | Rejected |

Selected target: Candidate A, `sendConciergeWelcome` Guide Channel Lookup. This selection approves tests and documentation only. **No Channel Lookup Runtime Integration Slice Approved.**
