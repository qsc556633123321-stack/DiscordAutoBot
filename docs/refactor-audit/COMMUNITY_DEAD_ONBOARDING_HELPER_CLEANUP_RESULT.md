# Community Dead Onboarding Helper Cleanup Result

## Completed

- `readOnboardingData` is removed from `src/systems/communityConcierge.js`.
- `saveOnboarding` is removed from `src/systems/communityConcierge.js`.
- Neither identifier remains in production `src/**`, including exports, aliases, or shims.

## Preserved Runtime Ownership

`CommunityOnboardingStateReader` remains runtime-active. Guide, Roadmap, and
Welcome each construct it once per invocation and use their existing tracking
adapter. `ONBOARDING_FILE`, `readJson`, and `ensureFile` remain owned by the
Community Concierge runtime; this slice does not move filesystem ownership.

## Boundary Status

- Message tracking adapter: reader-backed and runtime-active.
- Channel tracking adapter: reader-backed and runtime-active.
- Application ports, persistence, composition, JSON schema, and Discord
  behavior: unchanged.

The deletion removes only private zero-consumer compatibility helpers. Guide,
Roadmap, and Welcome behavior is covered by their existing runtime regression
suites.
