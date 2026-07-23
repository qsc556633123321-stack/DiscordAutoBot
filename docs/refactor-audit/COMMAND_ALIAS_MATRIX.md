# Command Alias Matrix

Generated: 2026-07-23T13:41:16.116Z

The registry dynamically requires all 73 files from `src/legacy/commands` and exposes 65 final alias names after duplicate-name overwrites. No alias is removed or redeployed in this phase.

| Discord alias | Main command route | Legacy command file | Parameter-only wrapper | Independent business logic | Can become thin wrapper | Safe to retire now | Redeploy required to retire | Compatibility risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /ai-layout-repair | - | src/legacy/commands/ai-layout-repair.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /ai-reorganize-server | - | src/legacy/commands/ai_reorganize_server.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /analyze-server | /admin logs | src/legacy/commands/analyze_server.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /announce | /admin announce | src/legacy/commands/announce.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /announcement-pin-settings | - | src/legacy/commands/announcement-pin-settings.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /apply-role-permissions | - | src/legacy/commands/apply-role-permissions.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /archive-inactive-games | - | src/legacy/commands/archive-inactive-games.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /auto-organize | - | src/legacy/commands/auto_organize.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /automod-settings | /security automod | src/legacy/commands/automod-settings.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /bootstrap-community | - | src/legacy/commands/bootstrap-community.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /check-guest-visibility | /community check-guest | src/legacy/commands/check-guest-visibility.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /check-onboarding-visibility | - | src/legacy/commands/check-onboarding-visibility.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /check-role-visibility | /community check-role | src/legacy/commands/check-role-visibility.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /cleanup-empty-categories | - | src/legacy/commands/cleanup-empty-categories.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /cleanup-guest-roles | - | src/legacy/commands/cleanup-guest-roles.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /community-about | - | src/legacy/commands/community-about.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /community-architect | /community audit | src/legacy/commands/community-architect.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /community-roadmap | - | src/legacy/commands/community-roadmap.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /create-party | /voice create | src/legacy/commands/create-party.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /debug-permissions | /dev debug-permissions | src/legacy/commands/debug-permissions.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /dedupe-layout | - | src/legacy/commands/dedupe-layout.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /deep-cleanup | - | src/legacy/commands/deep_cleanup.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /dev-audit-commands | /dev report | src/legacy/commands/dev-audit-commands.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /factory-reset-server | - | src/legacy/commands/factory-reset-server.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /fix-game-category | /game fix | src/legacy/commands/fix-game-category.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /forget-channel-rule | - | src/legacy/commands/forget-channel-rule.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /game-registry-doctor | /game doctor | src/legacy/commands/game-registry-doctor.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /help-me-start | - | src/legacy/commands/help-me-start.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /layout-doctor | - | src/legacy/commands/layout-doctor.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /learn-channel | - | src/legacy/commands/learn-channel.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /linkguard-settings | /security linkguard | src/legacy/commands/linkguard-settings.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /linkguard-whitelist | - | src/legacy/commands/linkguard-whitelist.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /lock | /admin lock | src/legacy/commands/lock.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /memberguard-release | - | src/legacy/commands/memberguard-release.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /memberguard-settings | /security memberguard | src/legacy/commands/memberguard-settings.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /memberguard-status | /security status | src/legacy/commands/memberguard-status.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /memory-list | - | src/legacy/commands/memory-list.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /move-channel | - | src/legacy/commands/move-channel.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /plan-cleanup | - | src/legacy/commands/plan_cleanup.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /polish-server-design | - | src/legacy/commands/polish-server-design.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /rebuild-community-layout | - | src/legacy/commands/rebuild-community-layout.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /rebuild-community-v3 | /community rebuild | src/legacy/commands/rebuild-community-v3.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /rebuild-server | - | src/legacy/commands/rebuild_server.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /refresh-community-guide | - | src/legacy/commands/refresh-community-guide.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /rename-channel | - | src/legacy/commands/rename-channel.js | likely | unlikely; inspect before migration | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /repair-channel-permissions | /community repair-permissions | src/legacy/commands/repair-channel-permissions.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /restore-active-channels | - | src/legacy/commands/restore-active-channels.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /role-settings | - | src/legacy/commands/role-settings.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /setup-channel-panels | /panel force | src/legacy/commands/setup-channel-panels.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /setup-community-guide | - | src/legacy/commands/setup-community-guide.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /setup-game | /game setup | src/legacy/commands/setup-game.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /setup-roles | - | src/legacy/commands/setup-roles.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /setup-server | - | src/legacy/commands/setupServerLegacy.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /setup-ticket | /admin ticket | src/legacy/commands/setupTicketLegacy.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /setup-voicehub | /voice hub | src/legacy/commands/setup-voicehub.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /suggest-game | /game suggest | src/legacy/commands/suggest-game.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /tempvoice-doctor | - | src/legacy/commands/tempvoice-doctor.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /tempvoice-panel | /voice panel | src/legacy/commands/tempvoice-panel.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /tempvoice-settings | - | src/legacy/commands/tempvoice-settings.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /unlock | /admin unlock | src/legacy/commands/unlock.js | likely | unlikely; inspect before migration | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /voice-leaderboard | /voice leaderboard | src/legacy/commands/voice-leaderboard.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /voice-profile | /voice profile | src/legacy/commands/voice-profile.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /voice-room-info | - | src/legacy/commands/voice-room-info.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |
| /voice-status | /voice status | src/legacy/commands/voice-status.js | no | yes or unverified | yes; route exists | no | yes; deployed alias registration changes | medium: preserves existing alias contract |
| /welcome-settings | - | src/legacy/commands/welcome-settings.js | no | yes or unverified | yes; add route first | no | yes; deployed alias registration changes | high: no grouped route currently maps it |

## Evidence

- `aliasRegistry.js` calls `fs.readdirSync(LEGACY_COMMANDS_DIR)` and `require()` for every `.js` file.
- `commandRegistry.js` registers every alias returned by `loadAliases()` when aliases are included.
- `commandRouter.js` only maps a subset to the seven grouped commands; unmapped aliases remain deployed compatibility commands.
- A safe alias retirement therefore needs both a route/handler replacement and slash-command redeployment.