# Generic Community Publication Persistence Audit

## Components

- Application repository boundary:
  `src/application/community/ports/communityPublicationRecordRepository.js`
  requires `mergeRecord`.
- Use case:
  `createPersistCommunityPublicationRecordUseCase` accepts `{ guildId, patch }`.
- Composition:
  `createCommunityPublicationStateFeature` exposes
  `persistCommunityPublicationRecord.execute`.
- Infrastructure:
  `createCommunityPublicationStateFilesystemAdapter` owns root read, shallow
  merge, synchronous JSON write, logging, and `{ persisted, record }`.

## Exact Generic Contract

The generic application use case validates a non-empty string `guildId` and a
non-array object `patch`, appends a writer-provided `updatedAt`, and invokes
`repository.mergeRecord` synchronously. It has no publication discriminator,
no Roadmap field mapper, and no Discord dependency. The adapter owns legacy
field mapping only through the patch supplied by the caller.

Success returns `{ persisted: true, record }`; write failure is logged by the
adapter and returns `{ persisted: false, record }`. This feature is the reuse
target. It is not a new Roadmap-specific Port.
