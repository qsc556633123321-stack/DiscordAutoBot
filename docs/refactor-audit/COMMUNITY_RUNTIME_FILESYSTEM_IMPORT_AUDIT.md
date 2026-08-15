# Community Runtime Filesystem Import Audit

## `node:fs`
All current uses are in dead `ensureFile` / `readJson`. After their removal the
runtime `node:fs` import is removable.

## `node:path`
Current uses are `DATA_DIR`, `ONBOARDING_FILE`, and the dead `readJson` log
basename. Even after helper removal, `path` remains required because the same
constants are passed to active publication persistence features.
