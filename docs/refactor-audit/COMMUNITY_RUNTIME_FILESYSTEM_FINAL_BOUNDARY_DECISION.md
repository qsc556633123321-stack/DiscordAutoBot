# Community Runtime Filesystem Final Boundary Decision

## Decision
Candidate F, keep runtime path ownership for now.

Candidate B (`CommunityOnboardingJsonReaderFactory` exposing
`createDefaultCommunityOnboardingJsonReader`) is the preferred eventual narrow
JsonReader boundary and its test-only shape is frozen. It cannot be introduced
as the final ownership move in isolation because `DATA_DIR` and
`ONBOARDING_FILE` also remain active persistence inputs.

Candidates A, C, D, and E are rejected: defaults would blur injectable reader
configuration, add a provider/composition layer, or return filesystem knowledge
to StateReader. Full runtime path ownership cannot be closed without a separate
persistence-path boundary decision.
