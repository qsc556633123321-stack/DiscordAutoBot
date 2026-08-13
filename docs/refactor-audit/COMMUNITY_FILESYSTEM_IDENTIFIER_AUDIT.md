# Community Filesystem Identifier Audit

Base: `8497640 docs: close community welcome migration`.

## Current Production Owner

`src/systems/communityConcierge.js` owns `DATA_DIR`, `ONBOARDING_FILE`, `ensureFile`, and `readJson`. It imports `node:fs` and `node:path`. Guide, Roadmap, and Welcome each construct `CommunityOnboardingStateReader` with `{ filePath: ONBOARDING_FILE, readJson }`.

| Identifier | Production role | Consumers |
| --- | --- | --- |
| `DATA_DIR` | Parent directory for onboarding state | `ensureFile` |
| `ONBOARDING_FILE` | `src/data/onboarding-flows.json` location | reader construction; legacy write helper |
| `ensureFile` | Creates `DATA_DIR` then a missing file | `readJson` |
| `readJson` | Compatibility read primitive | Guide, Roadmap, Welcome through `CommunityOnboardingStateReader` |
| `writeJson` | Historical identifier | Removed; persistence is no longer owned here |

`CommunityOnboardingStateReader` owns no filesystem operation. Tracking message/channel adapters are reader-backed; each closed flow performs one state read per invocation.

## Boundary Finding

The runtime mixes orchestration and filesystem compatibility behavior. A future read-side boundary must move only path, ensure, read, parse, fallback, and logging semantics into Infrastructure. It must not absorb persistence, Discord, roles, buttons, or AI behavior.
