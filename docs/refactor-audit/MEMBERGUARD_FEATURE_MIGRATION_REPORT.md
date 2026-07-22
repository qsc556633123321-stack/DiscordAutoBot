# MemberGuard Feature Migration Report

## Migrated path

```text
Discord events / status presentation
  -> composition/memberGuardFeature
  -> application/memberGuard use cases
  -> domain/memberGuard policy
  -> infrastructure/storage/jsonMemberGuardRepository
  -> runtime adapter performs Discord side effects
```

## New modules

- `src/domain/memberGuard/memberGuardPolicy.js`
- `src/application/memberGuard/getMemberGuardStatusUseCase.js`
- `src/application/memberGuard/evaluateMemberGuardUseCase.js`
- `src/application/memberGuard/ports/memberGuardRepository.js`
- `src/infrastructure/storage/jsonMemberGuardRepository.js`
- `src/adapters/memberGuard/memberGuardRuntimeAdapter.js`
- `src/composition/memberGuardFeature.js`

## Preserved behavior

- `/memberguard-status` data, permissions, ephemeral defer/edit flow, and legacy wrapper remain unchanged.
- Active `messageCreate` and `guildMemberAdd` still call the same exported MemberGuard service API.
- Message deletion, timeout, warning, join guest role, safe mode, logs, guest permission application, and manual release remain runtime-adapter responsibilities.
- No guild/channel/role/permission mutation is performed during module construction or tests.

## Compatibility remaining

`src/legacy/commands/memberguard-status.js` remains the alias wrapper. `src/systems/memberGuard.js` is untouched rollback source and remains used by unrelated legacy consumers; therefore MemberGuard is not fully legacy-free.

## Tests

- Domain policy: bypasses, enabled state, allow/block, IDs, deterministic reasons.
- Application: status and evaluation use cases with fake repositories.
- Repository: guild scoping, defaults, normalized lists, write behavior using a temporary file.
- Composition/runtime: injected fake dependencies with no Discord API calls.
- Migration: active service source has no direct MemberGuard system or legacy import; wrapper data/execute references remain identical.

## Validation

`test:memberguard`, `test:memory`, `test:organizer`, `test:migration`, `test:legacy-audit`, `test:architecture`, `test:legacy-boundaries`, `quality:gate`, and `audit:legacy` passed. The final dashboard build passed after two retried local `spawn EPERM` environment failures. Architecture score is 100/100 and circular dependencies remain 0.

## Rollback

Revert this commit. The retained `src/systems/memberGuard.js` and legacy command are unchanged, so existing behavior can be restored without data rollback or slash-command redeployment.
