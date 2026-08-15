# Community Concierge Button Resolver Decision

| Candidate | Decision | Reason |
| --- | --- | --- |
| A. Application `CommunityConciergeButtonActionResolver` | Recommended | Pure UI-ID to semantic-intent mapping. |
| B. Frozen resolver factory | Rejected | No injected dependency or state exists. |
| C. Domain resolver | Rejected | Discord customId is a presentation/application boundary concern. |
| D. Runtime helper | Rejected | Would preserve business mapping in the runtime. |
| E. Full dispatcher implementation | Deferred | Prefix/error wrapper has a larger interaction blast radius. |
| F. Keep current permanently | Rejected | Mapping is isolated and fully characterized. |

Recommended API: `resolveCommunityConciergeButtonAction(customId)`, returning
one of `games`, `invest`, `dev`, `night`, `bot`, `roadmap`, or `null`.
