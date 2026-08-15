# Community Publication Persistence Default-Path Redirect Result

## Completed runtime redirect
`setupCommunityGuide` and `setupRoadmapPanel` now each construct
`createCommunityPublicationStateFeature()` with no path arguments. The generic
feature delegates to the existing filesystem adapter defaults, whose resolved
data directory and onboarding file exactly equal the previous runtime paths.

## Preserved behavior
- Guide and Roadmap still persist their existing request shapes synchronously
  after their finalized Discord mutations.
- Valid, missing-file, malformed-root, read-error, and write-error behavior is
  equivalent to explicit-path construction.
- Sequential Guide/Roadmap writes retain separate fields; normal roots retain
  unrelated guild/root fields.
- The filesystem adapter, StateReader, tracking, JsonReader construction,
  Welcome, JSON schema, and Discord mutation behavior were not modified.

## Remaining ownership
Explicit runtime persistence path dependency is removed. `node:path`,
`DATA_DIR`, and `ONBOARDING_FILE` remain runtime-owned exclusively for the
three active JsonReader constructions (Guide, Roadmap, Welcome).
