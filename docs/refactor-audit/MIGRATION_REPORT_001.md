# Migration Report 001: Check Onboarding Visibility

## Scope

- Migrated: `src/legacy/commands/check-onboarding-visibility.js` command execution workflow.
- Not migrated: the underlying legacy onboarding inspection algorithm in `src/legacy/community/communityBootstrapSystem.js`.
- Not changed: command name, command options, default permissions, alias registry, deployment list, Discord channel behavior, and `.env`.

## New Path

```text
legacy command thin wrapper
  -> src/presentation/commands/checkOnboardingVisibilityCommand.js
  -> src/application/community/checkOnboardingVisibilityUseCase.js
  -> src/domain/community/onboardingVisibilityPolicy.js
  -> src/services/community/communityPermissionService.js
  -> src/infrastructure/discord/onboardingVisibilityGateway.js
  -> retained legacy communityBootstrapSystem implementation
```

## Compatibility Outcome

- The legacy command is retained and re-exports the presentation command's `data` and `execute` members.
- The thin wrapper is active for the existing `/check-onboarding-visibility` alias.
- The infrastructure gateway preserves the prior legacy inspection and Embed-building implementation.
- No slash-command redeployment is required because the command definition serializes identically.

## Regression Coverage

`tests/migration/check-onboarding-visibility.test.js` compares a captured legacy baseline with the migrated command for:

- missing `ManageChannels` permission;
- successful inspection and Embed reply;
- failed inspection reply.

It also verifies that the retained legacy wrapper exports the same command data and execute function as the new presentation adapter.

## Verification

- `npm run test:migration`
- `npm run quality:gate`
- `npm run dashboard:build`

## Rollback

Revert only the import/body of `src/legacy/commands/check-onboarding-visibility.js` to its pre-migration implementation. The legacy inspection runtime was not changed and remains available.
