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
- Memory application modules must not import Discord.js, filesystem, path, `systems/serverMemory`, or legacy modules.
- Memory presentation modules must not import filesystem, path, `systems/serverMemory`, or legacy modules.
- The JSON channel-rule repository is the only migrated command storage adapter. It uses `jsonStore`; command tests use temporary files and never the project `server-memory.json` data file.

## Compatibility Gateways

Existing behavior sometimes remains legacy-owned during a migration. Those temporary edges are recorded in `src/config/legacyBoundaryAllowlist.js` with an exact source, target, and reason. The list is deliberately narrow: a newly added legacy import fails `npm run test:legacy-boundaries` unless it has an explicit, reviewed migration reason.

## CI Execution

`npm run test:legacy-boundaries` scans local `require()` dependencies and boundary rules. It is included in `npm run quality:gate`; therefore an unapproved active-to-legacy import fails the quality gate before merge.

## Migration Rule

New work must use application, domain, infrastructure, and presentation layers. A compatibility gateway is a temporary exception, not a destination: preserve the legacy source, document the reason, add regression coverage, and remove the allowlist entry only after the legacy dependency is no longer used.
