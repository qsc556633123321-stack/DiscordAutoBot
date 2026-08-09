# Roadmap Persistence Request Implementation Pattern

The application convention used by Roadmap publication modules is a named
factory/value-object module with CommonJS named exports. The implemented
`RoadmapPublicationPersistenceRequest.js` follows this convention:

- `createRoadmapPublicationPersistenceRequest` shallow-freezes the exact
  scalar envelope;
- `mapRoadmapPublicationPersistenceRequestToGenericInput` is a pure mapper;
- the mapper returns the existing generic `{ guildId, patch }` input;
- the module imports no Discord, filesystem, repository, or Guide code.

The application index re-exports these two functions. No new persistence Port,
repository, writer, result type, discriminator, or adapter is created.
