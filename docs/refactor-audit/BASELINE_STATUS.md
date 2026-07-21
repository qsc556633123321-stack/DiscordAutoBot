# Baseline Status

Generated: 2026-07-22

## Secret Handling

- `.env` exists but was not inspected.
- No token, API key, password, Supabase key, or other secret was printed or copied into this report.
- `.env.example` remains versionable.

## Install

Command: `npm ci`

Result:
- First sandboxed attempt failed with an environment/sandbox `EPERM` spawn/cleanup error.
- Escalated retry succeeded.

Install warnings:
- Deprecated package warnings were reported for `passport-discord@0.1.4` and `prebuild-install@7.1.3`.
- `npm audit` summary reported 10 vulnerabilities: 1 low, 4 moderate, 3 high, 2 critical.

Classification:
- First failure: environment/sandbox issue.
- Vulnerabilities/deprecations: existing dependency maintenance issue.

No dependency changes were made.

## Requested Baseline Commands

| Command | Status |
| --- | --- |
| `npm test` | 目前未提供 root `test` script |
| `npm run lint` | 目前未提供 `lint` script |
| `npm run typecheck` | 目前未提供 `typecheck` script |
| `npm run build` | 目前未提供 root `build` script |
| `npm run dashboard:build` | Passed |

## Existing Quality Commands

Command: `npm run quality:gate`

Result: Passed.

Included checks:
- `npm run analyze:dependencies`
- `npm run test:architecture`
- `npm run test:permissions`
- `npm run audit:dead-code`
- `npm run report:commands`
- `npm run report:complexity`

Key output:
- Architecture score: 100/100.
- Circular dependencies: 0.
- Architecture tests passed.
- Permission Matrix tests passed.
- Dead Module count: 0.
- Main commands: 7.
- Alias commands: 65.
- Deployed commands: 72.
- Main event entrypoints: 6.
- Legacy event hooks: 2.
- Largest active JS file reported by complexity scan: `src/systems/communityConcierge.js` at 388 lines.

## Dashboard Build

Command: `npm run dashboard:build`

Result:
- First sandboxed attempt compiled but failed during TypeScript/build worker spawn with `EPERM`.
- Retry completed successfully.

Classification:
- First failure: environment/sandbox spawn issue.
- Final result: build passed.

## Generated Output Cleanup

Removed rebuildable Next.js output:
- Initial `.next*` cleanup: 10 directories, 687.02 MB.
- Post-build `.next-dashboard` cleanup: 1 directory, 8.23 MB.

Total space saved: 695.25 MB.

`node_modules/` was intentionally kept for validation after `npm ci`, but it remains ignored and should not be committed or packaged.

