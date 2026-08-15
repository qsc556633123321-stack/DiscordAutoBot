# Community Runtime Filesystem Final Atomicity Decision

## Decision
Do not perform full helper-plus-path atomic cleanup.

The safe next implementation is dead-helper-only cleanup: remove `ensureFile`,
`readJson`, and the now-unused `node:fs` import from `communityConcierge.js`.
Keep `path`, `DATA_DIR`, and `ONBOARDING_FILE` because active persistence still
consumes the constants. No dual path and no composition are required.
