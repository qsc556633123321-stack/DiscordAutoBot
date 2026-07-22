# Organizer Memory Consumer Migration Report

## Change

The active organizer facade no longer delegates to `legacy/systemRuntimes/organizerRuntime.js`. Its channel-rule query now flows through the Memory composition root and a query-only `channelRuleReader` contract.

## New Paths

- `src/application/memory/getChannelRulesForOrganizerUseCase.js`
- `src/application/memory/ports/channelRuleReader.js`
- `src/application/organizer/createOrganizerPlanningUseCase.js`
- `src/application/organizer/ports/channelRuleReader.js`
- `src/domain/organizer/organizerScoring.js`
- `src/composition/organizerFeature.js`

## Preserved Behavior

- The `/auto-organize` slash command, aliases, plan storage, preview formatting, and Discord interaction behavior are unchanged.
- Scoring, rule weight handling, keyword matching, manual-review thresholds, move limit, AI review input, and reader-failure fallback are preserved.
- `serverMemory.js`, `server-memory.json`, `channelDelete.js`, Temp Voice, Community, Layout, and Permission systems are untouched.

## Verification

- Organizer application test uses a fake reader and no Discord API.
- Composition test validates injected reader wiring.
- Migration test verifies the active facade has no direct `serverMemory` or JSON repository reference.
- Architecture enforcement rejects prohibited Organizer application imports.
- `test:memory`, `test:organizer`, `test:migration`, `test:legacy-audit`, `test:architecture`, `test:legacy-boundaries`, `quality:gate`, and `audit:legacy` pass.
- Architecture score is 100/100 with zero circular dependencies.
- `dashboard:build` passed on a final retry. The same command also reproduced the known intermittent `spawn EPERM` in this environment; this remains an environment event recorded in the Phase 6 baseline, not a Dashboard source change.

## Legacy Status and Rollback

`src/legacy/systemRuntimes/organizerRuntime.js` remains unchanged and source-retained. Rollback is a one-file restoration of the previous `src/systems/organizer.js` compatibility re-export; no data conversion or command redeployment is required.
