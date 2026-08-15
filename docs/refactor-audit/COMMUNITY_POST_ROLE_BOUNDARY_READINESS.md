# Community Post-Role Boundary Readiness

| Candidate | Decision |
| --- | --- |
| A. Button Dispatch Boundary Preparation | Recommended next. Concierge routing still passes through the legacy dispatcher. |
| B. Channel Setup Boundary Preparation | Deferred; broader Discord mutation surface. |
| C. AI Text Generation Boundary Preparation | Deferred; external API and fallback behavior need a dedicated baseline. |
| D. Role Presentation Boundary | Deferred; current runtime wrapper intentionally preserves reply behavior. |
| E. Deployment Readiness | Deferred; other high-risk runtime boundaries remain. |
| F. Stop Refactor / Feature Work | Rejected; the isolated dispatcher boundary is ready for characterization. |
