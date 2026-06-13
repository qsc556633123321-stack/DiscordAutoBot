# Project Architecture V2

## Layer Boundaries

- `src/core`: framework-neutral Result, errors, logger, constants, and permission helpers.
- `src/domain`: Community Architecture V3 policies and canonical game identity rules.
- `src/services`: business use cases and the only supported entry points for commands.
- `src/infrastructure`: Discord writers, atomic JSON storage, OpenAI, Git, and logging adapters.
- `src/adapters/legacy`: compatibility facades for old command contracts.
- `src/legacy`: isolated implementations that still power compatibility paths during migration.
- `src/commands`: Discord interaction parsing and Result rendering only.

## Phase 3 Service Boundaries

These are the canonical service entry points:

- Permissions and Guest Gate: `src/services/community/communityPermissionService.js`
- Community bootstrap, rebuild, polish, Architect, and V3: `src/services/community/communityRebuildService.js`
- Game identity and categories: `src/domain/games/gameIdentityService.js` and `src/services/games/gameCategoryService.js`
- Channel panels: `src/services/community/channelPanelService.js`

Old import paths remain as very small adapters so events and factory-reset flows keep working.
Their implementations now live under:

- `src/legacy/permissions`
- `src/legacy/games`
- `src/legacy/community`

Commands must not import these legacy implementations or directly write Discord state.

## Migration Rule

New work enters through a service. Legacy implementations may be replaced behind that boundary,
but no new feature may add another parallel permission, game identity, or community rebuild path.

See [REFACTOR_AUDIT.md](REFACTOR_AUDIT.md) for remaining migration debt.
