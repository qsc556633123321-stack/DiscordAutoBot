# Duplication Audit

Generated: 2026-07-22

## High-Level Duplication Map

### Commands

Current shape:
- Main grouped commands live in `src/commands`.
- Alias and historical commands live in `src/legacy/commands`.
- Command registry/router combines both into 72 deployed commands.

Duplication risk:
- New grouped commands and old alias commands can drift if a legacy alias keeps business logic instead of delegating.

Future direction:
- Keep command files as thin routing layers only.
- Move behavior into services.
- Keep aliases only as compatibility wrappers.

### Events and Interactions

Current shape:
- Main events live in `src/events`.
- Interaction routing lives in `src/modules/interactions`.
- Legacy interaction runtime remains in `src/legacy/interactions`.

Duplication risk:
- Button, modal, and select menu logic can exist both in extracted handlers and legacy dispatcher fallback.

Future direction:
- Continue extracting custom ID families from legacy runtime into `src/modules/interactions`.
- Keep legacy fallback logged and measurable until unused.

### Community Layout and Rebuild

Current shape:
- V3 architecture source exists in domain/config areas.
- `src/services/community/communityRebuildService.js` is the intended service facade.
- Legacy implementations still exist in `src/legacy/community` and `src/legacy/systemRuntimes/communityV3BuilderRuntime.js`.
- Compatibility wrappers still exist in `src/systems`.

Duplication risk:
- Multiple files can define category names, role names, archive behavior, or permission assumptions.

Future direction:
- Treat `src/domain/community/communityArchitectureV3.js` as the only canonical structure.
- Use one rebuild service.
- Move old config/rules into read-only reference or remove after verification.

### Permission Logic

Current shape:
- `src/services/community/communityPermissionService.js` is the intended permission service.
- Legacy permission code remains in `src/legacy/permissions`.
- Some systems still directly edit permission overwrites.

Duplication risk:
- Guest Gate, onboarding visibility, public social, and role inheritance can diverge.

Future direction:
- Route all permission mutation through `src/infrastructure/discord/discordPermissionWriter.js`.
- Route all permission decisions through the community permission service and domain visibility policy.

### Game Identity and Dynamic Games

Current shape:
- Domain game registry/identity service exists.
- Legacy game channel builder remains active through service fallback.
- Game aliases and display-name logic may also appear in config and legacy runtime.

Duplication risk:
- Alias handling can recreate old bugs such as VALORANT/特戰 duplication or displayName being overwritten by alias.

Future direction:
- Use `src/domain/games/gameIdentityService.js` as the sole identity source.
- Use `src/services/games/gameCategoryService.js` as the sole game category workflow.

### Panels

Current shape:
- `src/services/community/channelPanelService.js` exists.
- `src/systems/channelPanels.js` wraps a legacy runtime.

Duplication risk:
- Panel content, custom IDs, and storage format can drift between service, systems, and legacy runtime.

Future direction:
- Move panel building and persistence into the service layer.
- Leave legacy panel runtime as fallback until all panel targets are covered.

### Storage

Current shape:
- `src/infrastructure/storage/jsonStore.js` exists for atomic JSON read/write.
- Several systems and legacy runtimes still call `fs.readFileSync` / `fs.writeFileSync` directly.

Observed direct JSON/file IO outside infrastructure includes:
- `src/systems/announcementPin.js`
- `src/systems/autoMod.js`
- `src/systems/communityConcierge.js`
- `src/systems/lfgSystem.js`
- `src/systems/memberGuard.js`
- `src/systems/nightCrewSystem.js`
- `src/systems/serverMemory.js`
- `src/systems/voiceHub.js`
- `src/systems/welcomeSystem.js`
- multiple files under `src/legacy/systemRuntimes`

Future direction:
- Migrate runtime JSON state to `jsonStore` or typed stores one subsystem at a time.
- Do not rewrite all storage in one step.

### Discord API Mutation

Current shape:
- Infrastructure writers exist:
  - `src/infrastructure/discord/discordChannelRepository.js`
  - `src/infrastructure/discord/discordPermissionWriter.js`
- Direct Discord mutation still exists in legacy runtimes and some active systems.

Observed active direct mutation examples:
- `src/systems/activeChannelProtector.js`
- `src/systems/communityArchitectExecutor.js`
- `src/systems/communityConcierge.js`
- `src/systems/communityStructureManager.js`
- `src/systems/deepCleanupExecutor.js`
- `src/systems/lfgSystem.js`
- `src/systems/memberGuard.js`
- `src/systems/nightCrewSystem.js`
- `src/systems/serverLogs.js`
- `src/systems/voiceHub.js`

Future direction:
- Move direct create/rename/move/permission writes behind Discord infrastructure modules.
- Start with high-risk permission and deletion paths.

