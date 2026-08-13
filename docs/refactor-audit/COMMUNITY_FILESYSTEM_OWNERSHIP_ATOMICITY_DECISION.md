# Community Filesystem Ownership Atomicity Decision

1. A future read-only filesystem boundary may be implemented alone without runtime wiring.
2. Changing `CommunityOnboardingStateReader` from `{ filePath, readJson }` changes all three active construction sites.
3. That reader contract migration and the Guide/Roadmap/Welcome runtime construction redirect must be one atomic slice.
4. Do not introduce a dual-mode reader accepting both contracts: it hides ownership and prolongs a second compatibility path.

The publication-state filesystem adapter is not part of this migration because it couples read and write behavior.
