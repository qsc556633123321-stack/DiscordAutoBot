# Legacy Audit

Generated: 2026-07-22

## Summary

`src/legacy` is not dead code. It is a quarantine area that still powers many compatibility paths, alias commands, fallback interaction handlers, and legacy runtime wrappers. It must not be deleted until each path is replaced and verified through the command registry, dependency graph, and runtime tests.

The latest dead-code audit reports `Dead Module: 0`, so no legacy source file is safe to remove based only on the current automated audit.

## Legacy Areas

### `src/legacy/commands`

Purpose:
- Contains the historical slash command implementations.
- Main commands now expose grouped entrypoints, but aliases still route to these command files.

Still referenced by:
- `src/modules/commands/aliasRegistry.js`
- `src/modules/commands/commandRouter.js`
- `src/adapters/legacy/legacyCommunityCommandExecutor.js`
- Individual legacy command wrappers.

Risk:
- Dynamic command loading means static search alone is not sufficient to prove a command is unused.
- Removing these files can break deployed slash command aliases.

### `src/legacy/events`

Purpose:
- Legacy event hooks loaded for compatibility.

Still referenced by:
- `src/index.js`, which loads every `.js` file in `src/legacy/events`.
- `scripts/report-command-count.js`, which counts legacy event hooks.

Risk:
- Deleting these can silently remove runtime event behavior.

### `src/legacy/interactions`

Purpose:
- Legacy interaction dispatcher/runtime for buttons, modals, select menus, and autocomplete fallback.

Still referenced by:
- `src/modules/interactions/*InteractionHandler.js`
- `src/modules/interactions/buttonHandlers/*.js`

Risk:
- Many custom IDs still fall back to this runtime. Deleting it can break panel, voice, role, game, and admin buttons.

### `src/legacy/layout`

Purpose:
- Legacy layout repair and decision runtime.

Still referenced by:
- `src/modules/layout/layoutDecisionEngine.js`

Risk:
- Layout repair, doctor reports, and execution paths may still depend on the runtime.

### `src/legacy/community`

Purpose:
- Historical community bootstrap, rebuild, and polish implementations.

Still referenced by:
- `src/services/community/communityRebuildService.js`
- `src/services/community/communityPermissionService.js`
- system compatibility wrappers.

Risk:
- These files still contain Discord channel/role mutation code.
- Removing them can break rebuild, bootstrap, polish, and permission repair workflows.

### `src/legacy/games`

Purpose:
- Historical game category and dynamic game builder logic.

Still referenced by:
- `src/services/games/gameCategoryService.js`
- `src/systems/gameChannels.js`

Risk:
- Game setup, fix, metadata repair, and dynamic game category behavior can still route here.

### `src/legacy/permissions`

Purpose:
- Historical Guest Gate, role permissions, and permission template logic.

Still referenced by:
- `src/services/community/communityPermissionService.js`
- `src/config/permissionTemplates.js`
- `src/systems/guestGate.js`
- `src/systems/rolePermissions.js`
- `src/systems/communityV3PermissionBuilder.js`

Risk:
- Permission behavior is high risk. Do not remove until permission tests cover every replacement path.

### `src/legacy/systemRuntimes`

Purpose:
- Runtime quarantines for systems such as temp voice, channel panels, link guard, factory reset, organizer, role manager, and game suggestions.

Still referenced by:
- `src/systems/*.js` compatibility wrappers.

Risk:
- These are still active behavior behind old system module names.

### `src/legacy/deprecated`

Purpose:
- Deprecated service facades retained after prior refactor phases.

Still referenced by:
- Some deprecated services reference active system wrappers.
- Dependency and legacy reports still inspect them.

Risk:
- These are better deletion candidates than runtime legacy, but require a release window and import verification before removal.

## Likely Duplicate Areas

- Legacy community rebuilders duplicate newer V3 rebuild services.
- Legacy permission builders duplicate community permission service goals.
- Legacy game channels duplicate game identity and category service goals.
- Legacy interactions duplicate extracted interaction modules.
- Legacy layout runtime duplicates extracted layout modules.

## Do Not Delete Yet

Do not delete any `src/legacy` file in this phase. The current audit cannot prove safe removal, and several legacy paths are loaded dynamically or through fallback adapters.

