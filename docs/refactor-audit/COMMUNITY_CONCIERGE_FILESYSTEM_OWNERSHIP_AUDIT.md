# Community Concierge Filesystem Ownership Audit

## Active runtime-owned surface

- `DATA_DIR`: local data directory path.
- `ONBOARDING_FILE`: `onboarding-flows.json` path passed to the reader and publication persistence features.
- `ensureFile`: creates directory/file before legacy-compatible reads.
- `readJson`: reads JSON, logs read failure, and returns the supplied fallback.

## Consumers

`readJson` is passed to exactly three per-invocation
`CommunityOnboardingStateReader` constructions: Guide, Roadmap, and Welcome.
`ONBOARDING_FILE` is also passed to the existing Guide and Roadmap persistence
features. There is no separate direct runtime JSON consumer.

## Decision

Filesystem ownership is still runtime-owned and is not ready for direct removal
or relocation without its own characterization slice. This audit does not
create a repository, adapter, Composition feature, or persistence change.
