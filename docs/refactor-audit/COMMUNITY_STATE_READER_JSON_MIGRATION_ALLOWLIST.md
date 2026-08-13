# Community StateReader JSON Migration Allowlist

The future atomic implementation production allowlist is exactly:

- `src/infrastructure/community/CommunityOnboardingStateReader.js`
- `src/systems/communityConcierge.js`

All other `src/**` paths remain forbidden, including `CommunityOnboardingJsonReader.js`, tracking adapters, persistence, Composition, JSON data, roles, buttons, and AI.
