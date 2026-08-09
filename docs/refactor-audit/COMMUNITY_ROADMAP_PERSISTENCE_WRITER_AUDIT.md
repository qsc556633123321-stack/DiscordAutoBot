# Community Roadmap Persistence: Writer Audit

`saveOnboarding` remains runtime-owned in
`src/systems/communityConcierge.js`. It creates
`createCommunityPublicationStateFeature`; the use case is
`persistCommunityPublicationRecordUseCase` and the default writer is
`src/infrastructure/community/communityPublicationStateFilesystemAdapter.js`.

The adapter reads the complete `src/data/onboarding-flows.json` root, treats
missing/malformed/non-object JSON as an empty root after a read-failure log,
and shallow-merges the existing guild record, patch, and writer-owned
`updatedAt`. It synchronously writes the full root using two-space JSON plus a
trailing newline. There is no cache or atomic rename; a successful
read-after-write sees disk state.

`writeFileSync` errors are logged and returned as `{ persisted: false, record
}`. Success returns `{ persisted: true, record }`. The Roadmap runtime uses the
record through `saveOnboarding` and does not inspect `persisted`, so writer
failure is swallowed for the observable flow. `ensureFile` setup failure is
not covered by that writer-failure guarantee and remains a blocker.

The generic publication feature is the only reuse candidate; do not add a
parallel Roadmap JSON writer.
