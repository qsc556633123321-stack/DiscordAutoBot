# Runtime Path Map

Generated: 2026-07-22T14:22:59.958Z

| Flow | Entry | Router/service/module | Legacy hop | API/storage | Path status |
| --- | --- | --- | --- | --- | --- |
| Bot startup | src/index.js | commandRegistry + src/events directory loader | aliasRegistry dynamic command loader; src/legacy/events directory loader | Discord client login | new architecture + legacy dynamic loader |
| Slash command registry | src/index.js | src/modules/commands/commandRegistry.js | aliasRegistry.js requires every legacy command | client.commands / deploy registry | new registry + legacy aliases |
| Main command execution | interactionGateway -> slashInteractionHandler | commandRouter.route() | legacy command.execute() | Discord interaction reply | new router + legacy implementation |
| Alias command execution | interactionGateway -> slashInteractionHandler | commandRouter.routeAlias() | legacy command.execute() | Discord interaction reply | legacy-compatible path |
| Button interaction | interactionGateway -> buttonInteractionHandler | buttonHandlers/{role,game,voice,panel,admin}Buttons | legacyInteractionDispatcher -> legacyInteractionRuntime | Discord API / systems | new family routing + legacy handler |
| Modal interaction | interactionGateway -> modalInteractionHandler | direct fallback dispatcher call | legacyInteractionDispatcher -> legacyInteractionRuntime | Discord API / systems | complete legacy path |
| Select menu interaction | interactionGateway -> selectMenuInteractionHandler | direct fallback dispatcher call | legacyInteractionDispatcher -> legacyInteractionRuntime | Discord API / systems | complete legacy path |
| Autocomplete | interactionGateway -> autocompleteInteractionHandler | direct fallback dispatcher call | legacyInteractionDispatcher -> legacyInteractionRuntime | Discord API / systems | complete legacy path |
| Voice events | src/events/voiceStateUpdate.js | src/modules/events/voiceStateUpdateGateway.js | systems/tempVoice -> legacy tempVoiceRuntime; voice hub/activity wrappers | Discord voice state + JSON storage | two logic layers |
| Legacy events | src/index.js | legacy/events directory loader | channelDelete.js; guildMemberUpdate.js | Discord event callbacks | complete legacy event path |
| Community rebuild | legacy command or /community rebuild | communityRebuildService | communityBootstrapSystem + serverPolisher | Discord channel/role mutation | new service + legacy runtime |
| Permission repair | legacy command or /community repair-permissions | communityPermissionService | guestGate + rolePermissions + communityBootstrapSystem | discordPermissionWriter | new service + legacy fallback |
| Game category creation | legacy command or /game setup/suggest/fix | gameCategoryService | legacy/games/gameChannels + game suggestion runtime | Discord channels + JSON storage | new service + legacy runtime |
| Panel rendering | legacy command or panel route | communityService / systems channelPanels | channelPanelsRuntime | Discord messages + panel storage | compatibility wrapper |
| Layout repair | legacy command / community audit | modules/layout/layoutDecisionEngine | legacyLayoutDecisionEngine -> legacyLayoutRuntime | Discord mutations via executors | new rule shell + legacy fallback |

## Reading the Status

- **new architecture + legacy dynamic loader**: the entry is new, but runtime compatibility remains dynamic.
- **new router + legacy implementation**: routing is modernized; behavior remains legacy-owned.
- **complete legacy path**: no non-legacy handler exists yet.
- **two logic layers**: an active wrapper and legacy runtime both participate; migration requires regression coverage.