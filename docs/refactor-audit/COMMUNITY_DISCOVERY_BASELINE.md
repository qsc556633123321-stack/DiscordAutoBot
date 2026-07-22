# Community Discovery Baseline

## Scope and guardrail

This discovery records the Community feature boundary only. No Community runtime, Discord configuration, JSON data, environment file, Voice, Layout, Permission Repair, Memory, Organizer, MemberGuard, or Audit implementation was changed.

## Working tree at start

- Branch: `main`
- Starting commit: `4bf3f4a refactor: migrate audit feature vertical slice`
- Starting working tree: clean.

## Baseline commands

| Command | Result | Notes |
| --- | --- | --- |
| `npm run test:community` | Not provided | `package.json` has no Community-specific script. This is a test gap, not a runtime failure. npm also could not write its local cache log after reporting the missing script. |
| `npm run test:migration` | Pass | Includes the migrated `check-onboarding-visibility` regression. |
| `npm run test:legacy-audit` | Pass | Legacy inventory generator coverage passed. |
| `npm run test:legacy-boundaries` | Pass | 39 reviewed compatibility edges. |
| `npm run quality:gate` | Pass | Architecture score `100/100`; circular dependencies `0`. |
| `npm run audit:legacy` | Pass | Generated the same 100-file legacy inventory; timestamp-only generated output was intentionally not retained. |
| `npm run dashboard:build` | Pass on retry | First attempt compiled then failed with known Windows `spawn EPERM` during TypeScript. A second unchanged attempt completed successfully. |

## Existing Community runtime baseline

- Six active event entrypoints are loaded dynamically by `src/index.js`: ready, interactionCreate, guildMemberAdd, messageCreate, voiceStateUpdate, and error.
- Legacy events are additionally loaded dynamically from `src/legacy/events`; this makes static "unused" conclusions unsafe.
- Seven grouped commands and 65 aliases are registered by `src/modules/commands/commandRegistry.js` / `aliasRegistry.js`.
- Community aliases are dynamically loaded from `src/legacy/commands`, so legacy command files remain runtime-required unless their registry contract changes in a dedicated migration.

## Discovery conclusion

Community is **Discovery Complete / Migration Not Started**. Existing active behavior remains legacy-owned or compatibility-owned in several high-risk paths, especially bootstrap, rebuild, permission repair, role management, and guide setup.
