# Community Publication Persistence Path Boundary Decision

## Decision
Recommend **Candidate A, using the existing default generic persistence boundary**. The next implementation should change only the two runtime calls to `createCommunityPublicationStateFeature()` with no explicit path dependencies. The existing adapter defaults already produce the exact current paths, so a new `createDefaultCommunityPublicationPersistence()` wrapper would duplicate an approved composition factory without reducing risk.

## Candidate comparison
- **A: approved, narrowed to existing defaults.** Keeps default filesystem path ownership in `communityPublicationStateFilesystemAdapter`; no new factory.
- **B: rejected now.** A shared path configuration would couple JsonReader and persistence in a broader, multi-flow migration.
- **C: rejected.** Guide/Roadmap-specific factories duplicate one generic persistence implementation.
- **D: rejected.** A value provider only relocates globals and adds no behavior boundary.
- **E: rejected.** Existing semantics are a merge writer, not evidence for a new repository abstraction.
- **F: rejected.** Keeping explicit runtime paths leaves a known, tested infrastructure default unused.

## Atomicity
Use sequence **D: persistence first, JsonReader later**. This changes only two persistence construction calls while preserving the three read constructions and avoids combining read and write ownership changes.
