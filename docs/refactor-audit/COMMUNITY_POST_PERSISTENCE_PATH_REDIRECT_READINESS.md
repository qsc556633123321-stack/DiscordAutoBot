# Community Post Persistence Path Redirect Readiness

## Candidate comparison
- **A: JsonReader Default-Path Boundary Preparation - recommended.** Three
  active JsonReader constructions remain and need their own behavior/identity
  characterization before any runtime path cleanup.
- **B: JsonReader Default-Path Implementation - not yet approved.** It needs
  the focused preparation from Candidate A.
- **C: Runtime Path Final Cleanup - blocked.** `node:path`, `DATA_DIR`, and
  `ONBOARDING_FILE` still serve all three JsonReader flows.
- **D: Role Boundary - deferred.** Not related to the remaining filesystem
  ownership boundary.
- **E: Button Boundary - deferred.** Higher risk and unrelated.
- **F: AI Boundary - deferred.** Higher risk and unrelated.

## Next recommended slice
**JsonReader Default-Path Boundary Preparation.** It must prove exact path
identity and missing-file/read-fallback/logging behavior for Guide, Roadmap,
and Welcome before altering any JsonReader construction.
