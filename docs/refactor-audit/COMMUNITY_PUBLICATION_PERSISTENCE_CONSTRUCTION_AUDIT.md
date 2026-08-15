# Community Publication Persistence Construction Audit

## Scope
This preparation slice traces the active Guide and Roadmap persistence path without changing production code.

## Active construction
`src/systems/communityConcierge.js` constructs both flows after successful Discord mutation and before returning:

```text
setupCommunityGuide / setupRoadmapPanel
  -> createCommunityPublicationStateFeature({ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR })
  -> createCommunityPublicationStateFilesystemAdapter(...)
  -> createPersistCommunityPublicationRecordUseCase(...)
  -> mergeRecord(...)
```

Guide uses `createCommunityGuidePersistenceFeature`; Roadmap uses `createCommunityRoadmapPersistenceFeature`. Both delegate synchronously to the same generic feature surface.

## Infrastructure behavior
`communityPublicationStateFilesystemAdapter` already owns exact defaults:

- `DEFAULT_DATA_DIRECTORY = path.join(__dirname, '..', '..', 'data')`
- `DEFAULT_ONBOARDING_FILE = path.join(DEFAULT_DATA_DIRECTORY, 'onboarding-flows.json')`

It ensures the directory/file, reads a JSON-object root (or `{}` on parse/read failure after logging), shallow-merges one guild record plus `updatedAt`, and writes formatted JSON. Write failure is logged and returned as `{ persisted: false, record }`; it is not thrown by this adapter.

## Finding
The runtime path constants are construction artifacts for the two persistence feature calls, not domain data, Discord data, or a StateReader dependency. The existing filesystem adapter is already the default path owner. No new repository, persistence writer, or filesystem abstraction is justified.
