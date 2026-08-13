# Community StateReader JSON Atomic Migration Result

The StateReader dependency is migrated to `onboardingJsonReader`; Guide, Roadmap, and Welcome each construct one `CommunityOnboardingJsonReader` and one StateReader per invocation.

- `CommunityOnboardingJsonReader`: runtime-active, unchanged implementation.
- `CommunityOnboardingStateReader`: JsonReader-backed; no legacy `filePath` or `readJson` contract remains.
- Tracking adapters: unchanged; they continue to depend only on `readOnboardingState()`.
- Runtime path ownership: `DATA_DIR` and `ONBOARDING_FILE` remain in `communityConcierge.js`.
- `ensureFile` and `readJson`: retained dead cleanup candidates; no active runtime consumer remains.

Filesystem ownership is partially migrated. A separate cleanup preparation must characterize removal of the remaining runtime filesystem helpers before deleting them.
