# Migration Report 002: Low-risk Command Batch

## Scope

Migrated exactly three read-only legacy command implementations:

| Command | Legacy wrapper | Presentation | Application | Infrastructure | Domain | Regression test |
| --- | --- | --- | --- | --- | --- | --- |
| `/dev-audit-commands` | `src/legacy/commands/dev-audit-commands.js` | `src/presentation/commands/devAuditCommandsCommand.js` | `src/application/development/auditCommandsUseCase.js` | `src/infrastructure/project/commandAuditGateway.js` | Not required: the command formats an audit report and has no business rule. | `tests/migration/dev-audit-commands.test.js` |
| `/memory-list` | `src/legacy/commands/memory-list.js` | `src/presentation/commands/memoryListCommand.js` | `src/application/memory/listChannelRulesUseCase.js` | `src/infrastructure/storage/serverMemoryReadGateway.js` | Not required: this is a bounded read projection. | `tests/migration/memory-list.test.js` |
| `/memberguard-status` | `src/legacy/commands/memberguard-status.js` | `src/presentation/commands/memberGuardStatusCommand.js` | `src/application/security/getMemberGuardStatusUseCase.js` | Existing `src/services/security/memberGuardService.js` read API | Not required: no policy is introduced or altered. | `tests/migration/memberguard-status.test.js` |

## Preserved Behavior

- Legacy files remain present and are thin wrappers exporting the new command's `data` and `execute` references.
- Slash-command names, descriptions, default permissions, alias loading, reply shape, ephemeral behavior, embeds, and defer/edit order are unchanged.
- No command deployment metadata was changed.
- No Discord mutation, channel/category operation, role/member operation, permission overwrite, Temp Voice lifecycle, or environment access was added.

## Architecture Enforcement

`src/config/legacyBoundaryAllowlist.js` records exact, reasoned compatibility edges. `scripts/test-legacy-boundaries.js` rejects unlisted active-to-legacy imports and rejects forbidden domain/application/presentation dependencies. It is part of `quality:gate`.

## Validation

All final checks passed on 2026-07-22:

- `npm run test:migration`: passed all four migration regressions.
- `npm run test:legacy-audit`: passed; inventory records all four migrated wrappers.
- `npm run test:architecture`: passed; 72 command implementations remain loadable.
- `npm run test:legacy-boundaries`: passed; 40 exact compatibility edges are approved.
- `npm run quality:gate`: passed; architecture score 100 and circular dependency count 0.
- `npm run dashboard:build`: passed on retry after a transient local `spawn EPERM` process error.
- `npm run audit:legacy`: passed; 100 legacy modules remain inventoried.

## Rollback

Rollback is per command: restore only the corresponding legacy command body from the parent commit. Because the alias registry and deployment data remain untouched, no redeploy is needed for that rollback. The new presentation/application/infrastructure files can then be removed in a later, separate cleanup change only after references are checked.

## Next Candidate

Do not start it in this batch. The next most bounded candidate is `src/legacy/events/channelDelete.js`, but it needs Temp Voice lifecycle fixtures and is intentionally outside this read-only command migration.
