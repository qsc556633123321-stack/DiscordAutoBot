# Community AI Text Generation Boundary Decision

## Recommendation: Candidate A

Create a narrow Infrastructure `CommunityConciergeTextGenerationAdapter` whose
future operation receives an already-built request and fallback. It owns only
OpenAI lazy loading, client construction, request execution, exact response
normalization, and silent fallback behavior.

| Candidate | Decision |
| --- | --- |
| A. Transport adapter with request and fallback | Recommended |
| B. Adapter receives `kind` and `context` | Rejected: moves semantic prompt into Infrastructure |
| C. Application use case plus gateway | Rejected: no demonstrated business-rule boundary |
| D. Transport adapter while helper remains runtime-owned | Rejected: does not remove direct external ownership |
| E. Key/client-only extraction | Rejected: creates an incomplete boundary |
| F. Keep current runtime | Rejected: preparation has sufficiently frozen the narrow contract |

No Presentation, reply, dispatcher, Guide, Roadmap, or Welcome boundary is
reopened by this decision.
