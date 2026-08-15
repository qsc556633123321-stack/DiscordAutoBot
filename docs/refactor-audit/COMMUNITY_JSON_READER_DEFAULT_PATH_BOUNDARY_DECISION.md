# Community JsonReader Default Path Boundary Decision

## Recommended: Candidate B
Add an Infrastructure-local `createDefaultCommunityOnboardingJsonReader()` factory. It calls the existing reader constructor with exact default paths while permitting explicit `dataDirectory`, `filePath`, filesystem, path module, and logger overrides.

## Candidate comparison
- **A:** rejected because constructor defaults blur the fully-injected reader contract.
- **B:** approved as a narrow Infrastructure factory with retained testability.
- **C:** rejected because persistence adapter constants would couple read and write boundaries.
- **D:** rejected because a value provider only relocates constants.
- **E:** rejected because direct runtime reader creation does not need composition.
- **F:** rejected because explicit paths retain avoidable runtime ownership.
