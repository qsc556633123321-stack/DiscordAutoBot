# Project Architecture V2

## Current Snapshot

- Command Router: complete.
- Main command groups: 7.
- Legacy aliases: 65.
- Circular dependencies: 0.
- Active Architecture Score: 84 / 100.
- Previous baseline before legacy-score separation: 76 / 100.
- Legacy is still present and now tracked in `docs/LEGACY_BURN_DOWN.md`.

## Layer Boundaries

- `src/core`: framework-neutral Result, event bus, constants, and shared primitives.
- `src/domain`: Community Architecture V3 policies and canonical game identity rules.
- `src/services`: business use cases and the only supported entry points for commands.
- `src/infrastructure`: Discord writers and atomic JSON storage.
- `src/adapters/legacy`: compatibility facades for old command contracts.
- `src/legacy`: isolated implementations that still power compatibility paths during migration.
- `src/commands`: Discord interaction parsing and Result rendering only.

## Canonical Service Boundaries

These are the canonical service entry points:

- Permissions and Guest Gate: `src/services/community/communityPermissionService.js`
- Community bootstrap, rebuild, polish, Architect, and V3: `src/services/community/communityRebuildService.js`
- Game identity and categories: `src/domain/games/gameIdentityService.js` and `src/services/games/gameCategoryService.js`
- Channel panels: currently routed through `src/services/community/communityService.js` while the legacy panel builder is burned down.

Old import paths remain as very small adapters so events and factory-reset flows keep working.
Their implementations now live under:

- `src/legacy/permissions`
- `src/legacy/games`
- `src/legacy/community`

Commands must not import these legacy implementations or directly write Discord state.

## Migration Rule

New work enters through a service. Legacy implementations may be replaced behind that boundary,
but no new feature may add another parallel permission, game identity, or community rebuild path.

See [DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md), [LEGACY_BURN_DOWN.md](LEGACY_BURN_DOWN.md), and [REFACTOR_AUDIT.md](REFACTOR_AUDIT.md) for remaining migration debt.
