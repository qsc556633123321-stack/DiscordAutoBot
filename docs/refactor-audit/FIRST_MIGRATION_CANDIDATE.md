# First Migration Candidate

Generated: 2026-07-22T14:46:34.634Z

Status: Migrated; wrapper remaining. The underlying legacy runtime remains retained; this report records selection and follow-up order.

| Candidate | Direct refs | Runtime classification | Existing replacement | Risk | Testability | Migration cost | Score |
| --- | ---: | --- | --- | --- | --- | --- | ---: |
| src/legacy/commands/check-onboarding-visibility.js | 0 | ALIAS_REQUIRED, BOOT_REQUIRED, REPLACEMENT_EXISTS, RUNTIME_REQUIRED | src/presentation/commands/checkOnboardingVisibilityCommand.js | high | high: mock guild + permission result | medium-high | 86 |
| src/legacy/events/channelDelete.js | 0 | BOOT_REQUIRED, EVENT_REQUIRED, RUNTIME_REQUIRED | main event architecture exists; behavior replacement not confirmed | high | medium: event fixture needed | medium-high | 68 |
| src/legacy/deprecated/services/community/legacyAnalysisCommandService.js | 0 | REMOVAL_CANDIDATE | communityRebuildService is intended destination; direct replacement not confirmed | low after release-window verification | medium-low: six command behavior fixtures | high | 54 |

## First Target: `src/legacy/commands/check-onboarding-visibility.js`

- It has one public command contract and no channel mutation or permission overwrite writes.
- The command is now migrated to a presentation/application/domain/infrastructure path while its legacy file remains a thin wrapper.
- Regression coverage compares denied, successful, and failed-inspection replies against the captured legacy baseline.
- Keep the wrapper through a release-window review; rollback is a one-file reversion.

## Next Recommended Target (Do Not Start in This Phase)

### `src/legacy/events/channelDelete.js`

- It remains the next smallest bounded runtime candidate, but it is dynamically boot-loaded and touches Temp Voice cleanup.
- Before migration, add lifecycle fixtures for channel deletion, absent room metadata, and cleanup failure. Do not combine it with voice feature work.

## Why Not `legacyAnalysisCommandService.js` Yet

- It is small but dispatches six broad community commands; moving it first risks turning a small file into an accidental multi-command behavior migration.