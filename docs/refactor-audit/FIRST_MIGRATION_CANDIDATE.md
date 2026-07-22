# First Migration Candidate

Generated: 2026-07-22T12:55:38.227Z

This is a plan only. No module is moved or replaced in this phase.

| Candidate | Direct refs | Runtime classification | Existing replacement | Risk | Testability | Migration cost | Score |
| --- | ---: | --- | --- | --- | --- | --- | ---: |
| src/legacy/commands/check-onboarding-visibility.js | 0 | ALIAS_REQUIRED, BOOT_REQUIRED, REPLACEMENT_EXISTS, RUNTIME_REQUIRED | src/services/community/communityPermissionService.js (explicit adapter path) | high | high: mock guild + permission result | medium-high | 86 |
| src/legacy/events/channelDelete.js | 0 | BOOT_REQUIRED, EVENT_REQUIRED, RUNTIME_REQUIRED | main event architecture exists; behavior replacement not confirmed | high | medium: event fixture needed | medium-high | 68 |
| src/legacy/deprecated/services/community/legacyAnalysisCommandService.js | 0 | REMOVAL_CANDIDATE | communityRebuildService is intended destination; direct replacement not confirmed | low after release-window verification | medium-low: six command behavior fixtures | high | 54 |

## Recommended First Target

### `src/legacy/commands/check-onboarding-visibility.js`

- It has one public command contract and no channel mutation or permission overwrite writes.
- Its implementation already delegates to `legacyCommandAdapters.permissions.inspectOnboarding()` and `buildOnboardingEmbed()`; the active `communityPermissionService` exposes matching inspection/build functions.
- It is an alias-only migration: preserve `/check-onboarding-visibility`, replace only its internal handler with a thin adapter, and verify the embed/result against a mocked guild.
- It does not touch community rebuild, deletion, game setup, or high-fan-out interaction fallbacks.

## Why Not the Other Candidates First

- `channelDelete.js` is only 13 lines, but `src/index.js` dynamically boot-loads it and it reaches temp-voice lifecycle code, where a regression can leave stale voice metadata.
- `legacyAnalysisCommandService.js` is small but dispatches six broad community commands; moving it first risks turning a small file into an accidental behavior migration.

## Proposed Next-Phase Acceptance Criteria

1. Keep the existing slash command name and deployment entry unchanged.
2. Create a thin command adapter that calls `communityPermissionService.inspectOnboarding()` and the current embed builder.
3. Add fixture tests for manager-permission rejection, successful inspection, and failed inspection.
4. Keep the legacy command as a fallback for one release window; record fallback use before removing it.
5. Run `npm run quality:gate` and `npm run dashboard:build`; rollback is a one-file handler reversion.