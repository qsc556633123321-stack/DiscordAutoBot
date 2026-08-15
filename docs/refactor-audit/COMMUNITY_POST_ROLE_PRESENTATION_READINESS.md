# Community Post-role Presentation Readiness

## Completed boundary

Role Concierge payload construction is now Module-owned. The remaining
Concierge runtime concerns are dynamic link discovery, reply delivery, and
high-risk channel setup / AI generation outside this narrow button presentation
scope.

## Candidate assessment

| Candidate | Decision |
| --- | --- |
| A. Channel Setup Boundary Preparation | recommended next slice; highest remaining community mutation risk |
| B. AI Text Generation Boundary Preparation | later; separate external-service behavior requires its own baseline |
| C. Runtime Reply Boundary Preparation | not recommended; reply ownership is intentionally thin and stable |
| D. `quickLinks` Boundary Preparation | not recommended; runtime Discord cache lookup remains appropriately local |
| E. Deployment Readiness | blocked; several high-risk community flows remain legacy/runtime-owned |
| F. Stop Refactor / Feature Work | rejected; the next mutation boundary is sufficiently isolated to prepare |

The recommended next slice is **Channel Setup Boundary Preparation**. It must
characterize creation, permissions, duplicate avoidance, retries, persistence,
and partial failure before moving any Discord mutation runtime.
