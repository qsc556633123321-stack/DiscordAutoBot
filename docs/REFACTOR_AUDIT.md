# Project Architecture V2 Refactor Audit

Updated: 2026-06-13

## Phase 3 Completed

Phase 3 isolated the three highest-value legacy implementation groups while preserving stable
imports for events, factory reset, and interaction confirmation flows.

Canonical entry points:

- Permissions: `src/services/community/communityPermissionService.js`
- Community rebuild: `src/services/community/communityRebuildService.js`
- Game identity: `src/domain/games/gameIdentityService.js`
- Game categories: `src/services/games/gameCategoryService.js`

## Moved To Legacy In Phase 3

### Permissions

- `src/legacy/permissions/permissionTemplates.js`
- `src/legacy/permissions/guestGate.js`
- `src/legacy/permissions/rolePermissions.js`
- `src/legacy/permissions/communityV3PermissionBuilder.js`

### Games

- `src/legacy/games/gameChannels.js`

### Community

- `src/legacy/community/communityBootstrapSystem.js`
- `src/legacy/community/serverPolisher.js`
- `src/legacy/community/serverRebuilder.js`

Their old `src/systems` or `src/config` paths are now thin compatibility adapters. Architecture
tests enforce that those adapters remain at most four lines and point into `src/legacy`.

## Fully Converged Command Paths

The permission, community rebuild, and game category commands enter through their canonical
services. Command files do not directly create, rename, move, write permissions, or read JSON.

## High-Risk Legacy Left In Place

These remain active and should be migrated behind services in Phase 4:

- `src/events/interactionCreate.js`: directly calls legacy plan executors for button confirmations.
- `src/systems/communityArchitect.js`, `communityArchitectPlanner.js`, `communityArchitectExecutor.js`.
- `src/systems/communityV3Builder.js`: V3 plan persistence and execution.
- `src/systems/communityStructureManager.js`: dynamic structure workflow.
- `src/systems/gameSuggestionSystem.js`: approval flow and game creation integration.
- `src/systems/channelPanels.js`: panel builders used by interaction handlers.
- Temp Voice, Voice Hub, and LFG systems share `gameChannels` compatibility contracts.

Moving these now would risk breaking persisted button custom IDs and in-flight plans, so they are
documented instead of force-migrated.

## Direct JSON I/O Remaining

Legacy systems still using direct synchronous file access include:

- `announcementPin.js`
- `autoMod.js`
- `channelPanels.js`
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

Commands contain no direct Discord channel or permission writes. Legacy systems still writing
Discord state directly include Community Architect/V3 execution, game suggestion, Temp Voice,
Voice Hub, LFG, factory reset, cleanup, and safety workflows.

## Verification

Run:

```bash
npm run test:architecture
npm run audit:commands
```

Current expected audit:

- Implemented commands: 63
- Invalid commands: 0
- Documented only: 0
- Undocumented: 0
