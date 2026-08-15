# Community Button Dispatch Boundary Decision

| Candidate | Decision | Reason |
| --- | --- | --- |
| A. `CommunityConciergeButtonDispatcher` | Rejected | A second dispatcher would duplicate the legacy prefix/error contract. |
| B. Interaction-consuming handler | Rejected | It would combine routing and presentation with a large Discord blast radius. |
| C. Application semantic dispatcher | Recommended | A pure resolver can map exact supported custom IDs to semantic actions without Discord interaction objects. |
| D. Move all `concierge_*` branches | Deferred | Night, bot, and roadmap presentation need their own characterization. |
| E. Move legacy error wrapper | Deferred | Reply/defer behavior must remain owned by legacy until an explicit redirect. |
| F. Keep current forever | Rejected | The exact narrow routing contract is now sufficiently characterized. |

Recommended boundary: a test-characterized, pure semantic resolver for known
Concierge IDs. It belongs in Application only when implementation begins. The
legacy runtime must keep prefix matching, interaction error wrapping, and
fallback ownership. `handleConciergeButton` must keep presentation and reply
ownership during the first implementation slice.
