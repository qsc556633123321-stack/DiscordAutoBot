# Community Guide Persistence Request Implementation Pattern

The implementation follows `RoadmapPublicationPersistenceRequest`:

- File: `src/application/community/guidePublication/GuidePersistenceRequest.js`.
- Factory naming: `createGuidePersistenceRequest`.
- Mapper naming: `mapGuidePersistenceRequestToGenericInput`.
- The request envelope and generic-input envelope/patch use shallow `Object.freeze`.
- Input values, including nested arrays, retain exact reference identity.
- The module uses CommonJS named exports and is re-exported from `src/application/community/index.js`.

It is Application-only: no filesystem, Discord, repository, Port, writer, runtime, or Roadmap semantic dependency.
