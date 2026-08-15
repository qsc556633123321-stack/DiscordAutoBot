# Community Runtime Filesystem Ownership Cleanup Preparation Blocker

## Status
RESOLVED by Maintenance Slices #68 and #69.

## Base Verification
- Branch: `main`
- HEAD: `008fb79 refactor: migrate state reader to onboarding json reader`
- Working tree: clean before this blocker record was created.

## Failing Baseline Checks
The required regression-first command set was run against the clean committed
base. The following architecture assertions fail because they still require the
two source files from the *already committed* atomic migration to appear as an
uncommitted `git diff --name-only HEAD -- src` result:

- `tests/architecture/communityStateReaderJsonAtomicMigration.test.js`
- `tests/architecture/communityOnboardingJsonReaderImplementation.test.js`
- `tests/architecture/communityWelcomeFinalClosure.test.js`

Each currently expects this non-empty diff:

```text
src/infrastructure/community/CommunityOnboardingStateReader.js
src/systems/communityConcierge.js
```

On the clean base the actual result is `[]`, so the assertions fail before the
filesystem cleanup preparation can establish its own zero-production-diff
baseline.

## Impact
This is an existing test-guard defect, not evidence that the JsonReader-backed
runtime behavior regressed. The other required closure suites in the initial
run passed, but the slice contract requires every regression-first check to
pass before continuing.

## Resolution
The three guards now preserve their source-content architecture assertions and
require `git diff --name-only HEAD -- src` to be empty. This verifies the
post-commit architecture truth without treating a previous implementation's
working-tree diff as a permanent runtime contract.

## Follow-up Blocker
The repaired Welcome closure suite reaches an additional, previously masked
stale guard: `tests/architecture/communityTrackingAdapterReaderAtomicMigration.test.js`.
It makes the same invalid assertion that
`CommunityOnboardingStateReader.js` must be an uncommitted production diff.
That file was not one of the three tests approved for Maintenance Slice #68.
Maintenance Slice #69 repaired it using the same post-commit source-truth
strategy, with explicit StateReader, adapter dependency, runtime construction,
and clean-`src` checks.

No production source, filesystem helper, path constant, JsonReader,
StateReader, tracking adapter, persistence, or closed Guide/Roadmap/Welcome
flow was changed by this maintenance repair.
