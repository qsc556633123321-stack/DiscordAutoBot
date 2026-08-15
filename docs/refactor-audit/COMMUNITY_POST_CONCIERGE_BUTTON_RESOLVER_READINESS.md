# Post Concierge Button Resolver Readiness

| Candidate | Result |
| --- | --- |
| A. Button Dispatch Boundary Implementation | Recommended next. The prefix route and error wrapper are characterized but still legacy-owned. |
| B. Non-role Concierge Presentation Preparation | Deferred. Embed and reply behavior remains runtime-owned. |
| C. Channel Setup Boundary Preparation | Deferred. It is a separate Discord mutation boundary. |
| D. AI Text Generation Boundary Preparation | Deferred. It is unrelated to this deterministic resolver. |
| E. Deployment Readiness | Not ready. Further legacy runtime ownership remains. |
| F. Stop Refactor / Feature Work | Rejected. The next small boundary is already characterized. |

The recommended next slice is **Button Dispatch Boundary Implementation**. It
must retain the legacy runtime's exact prefix matcher, generic error reply, and
ignored handler return behavior while moving only the dispatch boundary that
has been separately prepared.
