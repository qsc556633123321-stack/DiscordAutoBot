# Community Publication Persistence Path Implementation Readiness

## READY

The existing generic composition feature already creates the filesystem adapter with its exact default onboarding path when no explicit dependencies are given. Characterization confirms identical Guide/Roadmap persistence behavior for normal and failure paths.

## Only recommended next slice
**Publication Persistence Runtime Default-Path Redirect**.

Approved production allowlist:

```text
src/systems/communityConcierge.js
```

Only replace the two explicit `createCommunityPublicationStateFeature({ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR })` calls with zero-argument construction. Do not change JsonReader construction, `node:path`, `DATA_DIR`, `ONBOARDING_FILE`, Discord behavior, persistence implementation, or JSON schema.

After that redirect, `node:path`, `DATA_DIR`, and `ONBOARDING_FILE` must remain because JsonReader has three active runtime consumers. A later, separate JsonReader default-path boundary decides their removal.
