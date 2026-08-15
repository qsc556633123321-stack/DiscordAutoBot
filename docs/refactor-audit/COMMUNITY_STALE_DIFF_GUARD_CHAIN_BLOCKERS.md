# Community Stale Diff Guard Chain Blocker

## Status
RESOLVED by Maintenance Slice #72.

## Newly Exposed Guard
`npm run test:community-state-reader-json-dependency-preparation` fails in:

```text
tests/architecture/communityStateReaderJsonDependencyPreparation.test.js:19
```

It expects the prior StateReader migration to remain as this uncommitted
production diff:

```text
src/infrastructure/community/CommunityOnboardingStateReader.js
src/systems/communityConcierge.js
```

On the clean committed base, actual is `[]`. This is the sixth instance of the
same historical working-tree-diff assumption.

## Scope Decision
This file was outside Maintenance Slice #71, which authorized only
`communityFilesystemOwnershipPreparation.test.js`. Maintenance Slice #72
repaired it with committed-source assertions and a clean-`src` guard. No
production source was changed.

## Resolution
The repaired guard verifies StateReader JsonReader delegation, runtime
construction counts, reader-backed tracking adapters, retained pre-cleanup
filesystem candidates, and a clean production source diff.
