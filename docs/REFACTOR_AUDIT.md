# Project Architecture V2 Refactor Audit

Updated: 2026-06-13

## Phase 2 Completed

- Community Architecture V3 implementation moved to `src/domain/community/communityArchitectureV3.js`.
- Game Registry and Game Identity implementation moved to `src/domain/games/`.
- Legacy config/system paths now act as compatibility adapters.
- Community rebuild entry point: `src/services/community/communityRebuildService.js`.
- Permission entry point: `src/services/community/communityPermissionService.js`.
- Game category entry point: `src/services/games/gameCategoryService.js`.
- Panel entry point: `src/services/community/channelPanelService.js`.
- Commands no longer directly create, rename, move, or write channel permissions.
- All command files are at most 120 lines.
- V3 plans, architect plans, Temp Voice, game metadata, create-entry metadata, and voice activity use atomic JSON storage.

## Moved To Legacy

- `src/legacy/commands/setupServerLegacy.js`
- `src/legacy/commands/setupTicketLegacy.js`
- `src/legacy/commands/analyze_server.js`
- `src/legacy/commands/ai_reorganize_server.js`
- `src/legacy/commands/auto_organize.js`
- `src/legacy/commands/deep_cleanup.js`
- `src/legacy/commands/plan_cleanup.js`
- `src/legacy/commands/rebuild_server.js`
- `src/legacy/games/gameAliases.js`

These remain callable through thin commands and services while their internal workflows are migrated.

## Duplicate Logic Audit

### Permission Logic

Canonical service: `communityPermissionService`.

Legacy dependencies still active:

- `src/config/permissionTemplates.js`
- `src/systems/communityBootstrapSystem.js`
- `src/systems/guestGate.js`
- `src/systems/rolePermissions.js`
- `src/systems/communityV3PermissionBuilder.js`
- permission execution branches in `src/events/interactionCreate.js`

### Layout / Rebuild Logic

Canonical service: `communityRebuildService`.

Legacy engines still active behind the service:

- `communityBootstrapSystem`
- `communityStructureManager`
- `serverPolisher`
- `serverRebuilder`
- `communityArchitect`
- `communityV3Builder`

They cannot be moved yet because button interactions and factory reset still import their plan executors directly.

### Game Identity

Canonical sources:

- `src/domain/games/gameRegistry.js`
- `src/domain/games/gameIdentityService.js`
- `src/services/games/gameCategoryService.js`

`src/config/gameRegistry.js` and `src/systems/gameIdentityService.js` are compatibility adapters only.

### Panel Setup

Canonical service: `channelPanelService`.

`src/systems/channelPanels.js` remains the legacy implementation because interaction handlers still use its panel builders.

## Direct JSON I/O Remaining

The following legacy systems still use direct synchronous file access and must migrate to `jsonStore`:

- `announcementPin.js`
- `autoMod.js`
- `channelPanels.js`
- `communityBootstrapSystem.js`
- `communityConcierge.js`
- `factoryReset.js`
- `gameSuggestionSystem.js`
- `layoutDecisionEngine.js`
- `lfgSystem.js`
- `linkGuard.js`
- `memberGuard.js`
- `nightCrewSystem.js`
- `roleManager.js`
- `serverMemory.js`
- `voiceHub.js`
- `welcomeSystem.js`

## Direct Discord Writes Remaining

Commands contain no direct Discord channel or permission writes.

Legacy systems still writing Discord state directly include:

- Community/layout: `communityBootstrapSystem`, `communityStructureManager`, `communityV3Builder`, `serverPolisher`, `serverRebuilder`, `layoutDecisionEngine`
- Games/voice: `gameChannels`, `gameSuggestionSystem`, `tempVoice`, `voiceHub`, `lfgSystem`
- Safety/operations: `memberGuard`, `serverLogs`, `deepCleanupExecutor`, `categoryCleaner`, `factoryReset`

Phase 3 should migrate these writes behind `discordChannelRepository` and `discordPermissionWriter`, starting with Community V3 execution and game category creation.

## Command Audit

- Implemented: 63
- Documented only: 0
- Missing deploy: 0
- Commands over 120 lines: 0
- Commands directly writing channel permissions: 0

Run:

```bash
npm run test:architecture
npm run audit:commands
```
