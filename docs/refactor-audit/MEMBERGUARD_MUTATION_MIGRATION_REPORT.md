# MemberGuard Mutation Migration Report

## Active path

```text
presentation command -> MemberGuard composition -> application use case
  -> repository action/result -> gateway action plan -> Discord mutation
```

`/memberguard-settings` uses `updateMemberGuardSettingsUseCase` plus `memberGuardPermissionGateway`. `/memberguard-release` uses `releaseMemberUseCase` plus `memberRoleGateway`.

## Preserved contracts

- Command names, descriptions, option names, option constraints, default `ManageGuild` permission, and ephemeral defer/edit reply flow match legacy command data.
- The alias registry maps the same command names to the new presentation implementations, so the current interaction dispatcher executes them without a Slash Command redeploy change.
- `.env`, project settings data, legacy command files, and `src/systems/memberGuard.js` are untouched.

## Partial failures

Permission overwrites and role mutations are isolated in gateways. Each operation returns `updated/skipped` or `removed/added/failed`; a failed item does not crash the full command. The reply reports partial release failures. There is no rollback because Discord side effects were already non-transactional in legacy behavior.

## Legacy status

The original settings and release files remain intact as rollback sources. Because this phase cannot edit `src/legacy/**`, they are retained compatibility sources rather than rewritten thin wrappers. The active registry path is migrated; MemberGuard remains `Migrated / Wrapper Remaining` until all unrelated system consumers are retired.

## Rollback

Revert this commit. The alias registry will return to the unchanged legacy handlers; no settings data migration or Slash Command deployment rollback is needed.

## Validation

`test:memberguard`, `test:memberguard-mutations`, `test:memory`, `test:organizer`, `test:migration`, `test:legacy-audit`, `test:architecture`, `test:legacy-boundaries`, `quality:gate`, and `audit:legacy` passed. `dashboard:build` passed. Architecture score remains 100/100 with zero circular dependencies.
