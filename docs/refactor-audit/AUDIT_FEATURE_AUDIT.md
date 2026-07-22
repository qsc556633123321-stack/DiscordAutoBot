# Audit Feature Audit

## Definition And Scope

Current Audit functionality means **Command Implementation Audit**: it compares the command registry with command documentation and renders the existing `/dev-audit-commands` embed. It is a read-only query; it is not a moderation/event audit-log system.

## Classified Inventory

| Classification | Path | Responsibility / side effects |
| --- | --- | --- |
| Active Runtime | `src/presentation/commands/devAuditCommandsCommand.js` | Existing slash command data, ephemeral defer, and unchanged embed rendering. |
| New Application | `src/application/audit/runCommandAuditUseCase.js` | Pure command-audit query orchestration through a port. |
| New Domain | `src/domain/audit/commandAuditReport.js` | Normalizes the plain command-report shape; no Discord or persistence dependency. |
| New Infrastructure | `src/infrastructure/project/commandAuditGateway.js` | Calls the pre-existing command audit script and returns plain report data. |
| New Composition | `src/composition/auditFeature.js` | Wires the gateway and query use case. |
| Rollback Source | `src/application/development/auditCommandsUseCase.js` | Retains the previous application factory and its default gateway behavior; it is no longer in the active command path. |
| Thin Wrapper | `src/legacy/commands/dev-audit-commands.js` | Direct re-export of the presentation command for deployed alias compatibility. |
| Script Only | `scripts/audit-commands.js` | Reads registry/docs and builds the pre-existing report. It owns filesystem access. |
| Test Only | `tests/**/audit/**`, `tests/migration/dev-audit-commands.test.js` | Domain, application, gateway, composition, presentation, runtime, and regression coverage. |
| Dashboard Only | `apps/web/app/dashboard/logs/page.js` | Static placeholder; it has no Audit API, storage, or runtime consumer. |
| Existing Logging Utility | `src/systems/serverLogs.js` | General server-log sender used by unrelated features; not an Audit Feature dependency. |

## Commands, Registry, Deploy, And Aliases

- Existing command: `/dev-audit-commands`.
- Existing grouped routes: `/dev audit-commands` and `/dev report` target that alias.
- `src/modules/commands/aliasRegistry.js` dynamically loads the legacy alias path.
- `src/modules/commands/commandRegistry.js` exposes the same data to deployment.
- `src/deploy-commands.js` deploys registry output. No command metadata changed.

## Query, Mutation, Events, Persistence, Renderer

| Area | Finding | Migration decision |
| --- | --- | --- |
| Query | Command registry/documentation report | Migrated. |
| Mutation | None | Not created. |
| Event producers | None | Not created. Existing Discord events are unrelated feature events. |
| Persistence | None | No repository is required; no new storage created. |
| Discord delivery | None | The command reply is the existing presentation renderer. |
| Renderer | Existing `Command Implementation Audit` embed | Preserved exactly. |
| Dashboard | Static logs placeholder only | Out of scope; no data contract exists. |

## Risks, Duplicates, And Rollback

- `src/application/development/auditCommandsUseCase.js` and the new audit use case overlap by design: the former is a compatibility facade, the latter is the source of truth.
- `src/systems/serverLogs.js` is not an Audit Log implementation for this feature; migrating it would change unrelated logging paths.
- The legacy command is a rollback source and remains dynamically loaded by the alias registry.
- No circular dependency was found in the Audit slice.

## Recommended Order

1. Migrate the existing Command Audit query path: completed in this phase.
2. Only introduce a separate Audit Event Producer slice when a real existing event/log contract is identified and approved.
