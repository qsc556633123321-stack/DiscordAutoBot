# Memory Feature Audit

## Current Surface

| Area | Current owner | Behavior | Target owner |
| --- | --- | --- | --- |
| List command | `src/presentation/commands/memoryListCommand.js` | Lists at most 25 rules in an ephemeral embed. | Migrated. |
| Learn command | `src/presentation/commands/learnChannelCommand.js` | Validates guild and ManageChannels, then upserts a keyword/category/weight rule. | Migrated; legacy wrapper remains. |
| Forget command | `src/presentation/commands/forgetChannelRuleCommand.js` | Validates guild and ManageChannels, then deletes a keyword rule. | Migrated; legacy wrapper remains. |
| Storage | `src/infrastructure/storage/jsonChannelRuleRepository.js` | Validates JSON shape and performs isolated list/upsert/delete operations. | Migrated command storage path. |

## Required Behavior

- Keywords are trimmed for display and compared case-insensitively within a guild.
- Upsert preserves an existing `createdAt` and refreshes `updatedAt`.
- Weight is an integer from 1 through 10; command default is 5.
- List returns no more than 25 entries.
- Delete normalizes the keyword and returns whether a matching rule existed.
- Command reply payloads remain ephemeral and preserve the deployed command data contract.

## References and Risks

- `src/legacy/systemRuntimes/organizerRuntime.js` still reads `src/systems/serverMemory.js`. It is outside this command migration and remains unchanged.
- `src/data/server-memory.json` is production-style project data. Tests must use temporary fixtures only.
- The Phase 4 `serverMemoryReadGateway.js` bridge has been retired after list moved to the repository.
- No aliases, slash-command deployment metadata, Discord API calls, or event paths are changed.

## Migration Boundary

This slice covers list, learn/upsert, forget/delete, validation, and storage only. It does not migrate organizer scoring or any unrelated system that currently reads server memory.
