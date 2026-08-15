# Community Runtime Filesystem Cleanup Implementation Readiness

## Recommended Next Slice
Candidate B: Dead Helper Cleanup Only.

## Approved Production Allowlist
- `src/systems/communityConcierge.js`

It may remove only dead `ensureFile`, dead `readJson`, and `node:fs` after
verifying no remaining references. `CommunityOnboardingJsonReader`, StateReader,
tracking adapters, persistence, and path constants are out of scope.

## Status
READY for the narrow dead-helper cleanup slice. Full filesystem ownership is
not yet migratable because persistence still owns runtime path consumers.
