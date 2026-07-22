# Memory Feature Vertical Slice Migration

## Feature Status

**Migrated; wrappers remaining.** The command-facing Memory feature no longer reads `src/systems/serverMemory.js`.

| Capability | Presentation | Application | Domain | Infrastructure | Legacy status |
| --- | --- | --- | --- | --- | --- |
| List | `memoryListCommand.js` | `listChannelRulesUseCase.js` | Not required beyond repository matching rules. | `jsonChannelRuleRepository.js` | `memory-list.js`: wrapper remaining. |
| Learn / upsert | `learnChannelCommand.js` | `upsertChannelRuleUseCase.js` | `channelRule.js`, `channelRulePolicy.js` | `jsonChannelRuleRepository.js` | `learn-channel.js`: wrapper remaining. |
| Forget / delete | `forgetChannelRuleCommand.js` | `deleteChannelRuleUseCase.js` | `channelRule.js` | `jsonChannelRuleRepository.js` | `forget-channel-rule.js`: wrapper remaining. |

## Domain Rules

- Trim keyword and category values.
- Match keywords case-insensitively within a guild.
- Require a non-empty keyword and category.
- Require an integer weight from 1 through 10.
- Preserve `createdAt` during an update and refresh `updatedAt` from the injected application clock.
- Normalize deletes before repository lookup.

## Storage Contract

`src/application/memory/ports/channelRuleRepository.js` documents the repository contract. The JSON adapter implements `listByGuild`, `findByKeyword`, `upsert`, and `deleteByKeyword` using `jsonStore`. It validates top-level and guild-level JSON shape, propagates invalid JSON errors, and does not mutate unrelated guild data.

## Legacy and Runtime Boundary

- The three legacy command files are retained as thin wrapper exports; command names, options, permissions, and reply contracts are unchanged.
- `src/systems/serverMemory.js` remains unchanged and is still imported only by the non-migrated organizer legacy runtime.
- `serverMemoryReadGateway.js` was a Phase 4 command bridge and has been retired; it has no remaining runtime reference.
- No production data fixture was read or modified. Repository tests create and remove isolated temporary files.

## Test Coverage

- Domain normalization, validation, matching, timestamps, and weight tests.
- Application list limit, insert, update, delete, validation, injected clock, and repository failure tests.
- Repository list, upsert, cross-guild isolation, delete, invalid JSON, and invalid shape tests.
- Migration parity tests for list, learn, and forget command responses, command data, permission denial, guild denial, default weight, update, and failure payloads.

## Validation

- `npm run test:memory`: passed.
- `npm run test:migration`: passed all six command migration tests.
- `npm run test:legacy-audit`: passed; all three Memory command wrappers are marked `Migrated; wrapper remaining`.
- `npm run test:architecture`: passed.
- `npm run test:legacy-boundaries`: passed; no Memory application or presentation path imports `systems/serverMemory`.
- `npm run quality:gate`: passed; architecture score 100 and circular dependency count 0.
- `npm run audit:legacy`: passed; 100 legacy files remain inventoried.
- `npm run dashboard:build`: blocked by a local `spawn EPERM` while Next.js starts its post-TypeScript worker process. Compilation and TypeScript completed, but the process exited non-zero. This is recorded as an environment/process-permission issue; no Dashboard file was changed in this migration.

## Rollback

Each command can be rolled back independently by restoring the prior body of its legacy wrapper. The slash-command deployment and alias registry do not change. The legacy `serverMemory.js` system remains available for the separate organizer path.
