# Community StateReader JSON Atomicity Decision

Changing the StateReader dependency from `{ filePath, readJson }` to `{ onboardingJsonReader }` must atomically modify only:

1. `src/infrastructure/community/CommunityOnboardingStateReader.js`
2. `src/systems/communityConcierge.js`

`CommunityOnboardingJsonReader.js` must remain unchanged. Tracking adapters remain unchanged because they already depend only on `readOnboardingState()`. No dual-mode StateReader, Composition feature, persistence change, or repository is approved.
