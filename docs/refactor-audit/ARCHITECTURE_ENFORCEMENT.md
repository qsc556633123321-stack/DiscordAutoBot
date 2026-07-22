# Architecture Enforcement

## Scope

This guard prevents unreviewed dependencies from active code into `src/legacy` while the migration is incremental. It does not remove or change any Discord runtime behavior.

## Enforced Boundaries

- `src/domain/**` must not depend on Discord.js, filesystem, Supabase, environment variables, infrastructure, presentation, or legacy modules.
- `src/application/**` must not depend on Discord.js, environment variables, presentation, legacy modules, or direct Discord mutations.
- `src/presentation/**` must not import legacy modules directly; it dispatches to application use cases.
- Active code under application, domain, infrastructure, presentation, modules, services, and systems may only import a legacy module through an exact allowlist entry.

## Memory Slice Rules

- Memory domain modules must remain pure: no Discord.js, filesystem, application, infrastructure, presentation, systems, or legacy imports.
- Memory application modules depend only on the channel-rule repository port and domain/core contracts. They must not import infrastructure, presentation, legacy, systems, Discord.js, filesystem, path, or `process.env`.
- Memory presentation modules receive use cases through `src/composition/memoryFeature.js`; they must not construct JSON repositories or import filesystem, path, `systems/serverMemory`, or legacy modules.
- The Memory composition root is the only layer that wires the application factories to `jsonChannelRuleRepository`.
- The JSON channel-rule repository is the only migrated command storage adapter. It uses `jsonStore`; command tests use temporary files and never the project `server-memory.json` data file.

## Organizer Memory Consumer Rules

- Organizer planning receives channel rules through the `channelRuleReader` query contract.
- `src/application/organizer/**` must not import `systems/serverMemory`, the JSON channel-rule repository, Discord.js, filesystem, path, environment variables, or legacy modules.
- `src/composition/organizerFeature.js` is the only runtime wiring point between Memory's organizer query and the organizer planning use case.
- `src/systems/organizer.js` is the active compatibility facade. It must not import the legacy organizer runtime or `serverMemory.js` directly.
- The legacy organizer runtime remains source-retained for rollback only. It is not part of the active organizer consumer path.

## MemberGuard Vertical Slice Rules

- `src/domain/memberGuard/**` is deterministic and must not import Discord.js, storage, application, presentation, composition, systems, or legacy modules.
- `src/application/memberGuard/**` depends only on ports and domain policy. It must not import Discord.js, filesystem, path, environment variables, infrastructure, presentation, systems, or legacy modules.
- `src/infrastructure/storage/jsonMemberGuardRepository.js` is the guild-scoped settings adapter and uses `jsonStore`; it does not return Discord objects.
- `src/composition/memberGuardFeature.js` is the sole active wiring point for repository, use cases, runtime adapter, logging gateway, and Link Guard safe-mode hook.
- `src/services/security/memberGuardService.js` is an active facade over composition and must not import `src/systems/memberGuard.js` or `src/legacy/**`.
- Discord message/member side effects are confined to `src/adapters/memberGuard/memberGuardRuntimeAdapter.js`.
- `src/legacy/commands/memberguard-status.js`, `memberguard-settings.js`, and `memberguard-release.js` are alias-compatible thin wrappers that only re-export their presentation commands.
- MemberGuard settings and release application use cases accept IDs and action-plan facts only; they must not import Discord.js, gateway implementations, composition, systems, or legacy modules.
- MemberGuard permission and role mutations are limited to `src/infrastructure/discord/memberGuardPermissionGateway.js` and `src/infrastructure/discord/memberRoleGateway.js`.
- MemberGuard presentation commands must not import JSON storage, `systems/memberGuard`, or legacy mutation implementations. They receive use cases and gateways through the composition feature.
- MemberGuard legacy command wrappers must stay within five lines and must not import Discord.js, services, systems, or mutation APIs; `npm run test:legacy-boundaries` enforces this contract.

## Audit Command Slice Rules

- `src/domain/audit/**` is pure command-report normalization and must not import Discord.js, filesystem, path, environment variables, application, infrastructure, presentation, composition, systems, or legacy modules.
- `src/application/audit/**` depends on an audit gateway port and domain policy only. It must not import Discord.js, filesystem, path, environment variables, infrastructure implementations, presentation, composition, systems, or legacy modules.
- `src/presentation/commands/devAuditCommandsCommand.js` owns the unchanged slash definition and embed rendering. It receives the query use case from `src/composition/auditFeature.js` and must not import storage, legacy, systems, or infrastructure implementations.
- `src/infrastructure/project/commandAuditGateway.js` is the sole adapter that invokes the existing `scripts/audit-commands.js` implementation.
- `src/legacy/commands/dev-audit-commands.js` is a direct presentation re-export. It must not contain Discord imports, command construction, option parsing, persistence, replies, or business logic.
- The current feature has no Audit entry persistence, Discord delivery gateway, or event producer. Do not create one as part of command-audit maintenance.

## Community About Slice Rules

- `src/domain/community/communityAbout.js` is a pure immutable facts normalizer. It must not import Discord.js, filesystem, path, environment variables, application, infrastructure, presentation, composition, legacy, or systems modules.
- `src/application/community/getCommunityAboutUseCase.js` depends only on the Community About gateway port, the pure domain model, and core Result helpers. It must not import Discord.js, infrastructure implementations, presentation, composition, legacy, systems, filesystem, path, or environment variables.
- `src/domain/community/communityAbout.js` is the single source of static About facts. `src/infrastructure/community/communityAboutGateway.js` maps the supplied guild-name fact and never replies to Discord.
- `src/composition/communityAboutFeature.js` is the only Community About wiring point and supports gateway injection for tests.
- `src/presentation/commands/communityAboutCommand.js` preserves the slash definition and reply renderer. It may use Discord.js builders and composition, but may not import storage, infrastructure, legacy, Community systems, filesystem, or path.
- `src/legacy/commands/community-about.js` is a direct presentation re-export. It must not contain Discord command construction, interaction logic, storage, rendering, or Community facts.

## Compatibility Gateways

Existing behavior sometimes remains legacy-owned during a migration. Those temporary edges are recorded in `src/config/legacyBoundaryAllowlist.js` with an exact source, target, and reason. The list is deliberately narrow: a newly added legacy import fails `npm run test:legacy-boundaries` unless it has an explicit, reviewed migration reason.

## CI Execution

`npm run test:legacy-boundaries` scans local `require()` dependencies and boundary rules. It is included in `npm run quality:gate`; therefore an unapproved active-to-legacy import fails the quality gate before merge.

## Migration Rule

New work must use application, domain, infrastructure, presentation, and an explicit composition layer where runtime wiring is needed. A compatibility gateway is a temporary exception, not a destination: preserve the legacy source, document the reason, add regression coverage, and remove the allowlist entry only after the legacy dependency is no longer used.
