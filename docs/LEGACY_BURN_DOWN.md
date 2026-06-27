# Legacy Burn Down

Generated during Architecture Score 80+ Sprint.

## Summary

- L1 still used by main flow: 16 files
- L2 alias / adapter used: 64 files
- L3 replaceable: 3 files
- L4 removable/deprecated: 4 files

## L1: Still In Main Flow

These still affect active service, event, or system paths and should be migrated behind services before removal.

- `src/legacy/commands/ai_reorganize_server.js`
- `src/legacy/commands/analyze_server.js`
- `src/legacy/commands/auto_organize.js`
- `src/legacy/commands/deep_cleanup.js`
- `src/legacy/commands/game-registry-doctor.js`
- `src/legacy/commands/plan_cleanup.js`
- `src/legacy/commands/rebuild_server.js`
- `src/legacy/commands/setupServerLegacy.js`
- `src/legacy/commands/setupTicketLegacy.js`
- `src/legacy/community/communityBootstrapSystem.js`
- `src/legacy/community/serverPolisher.js`
- `src/legacy/community/serverRebuilder.js`
- `src/legacy/games/gameChannels.js`
- `src/legacy/permissions/communityV3PermissionBuilder.js`
- `src/legacy/permissions/guestGate.js`
- `src/legacy/permissions/rolePermissions.js`

## L2: Alias / Adapter Used

These command files are still part of the 65 alias compatibility layer. They should be replaced by route handlers or service adapters before deletion.

- `src/legacy/commands/ai-layout-repair.js`
- `src/legacy/commands/ai-reorganize-server.js`
- `src/legacy/commands/analyze-server.js`
- `src/legacy/commands/announce.js`
- `src/legacy/commands/announcement-pin-settings.js`
- `src/legacy/commands/apply-role-permissions.js`
- `src/legacy/commands/archive-inactive-games.js`
- `src/legacy/commands/auto-organize.js`
- `src/legacy/commands/automod-settings.js`
- `src/legacy/commands/bootstrap-community.js`
- `src/legacy/commands/check-guest-visibility.js`
- `src/legacy/commands/check-onboarding-visibility.js`
- `src/legacy/commands/check-role-visibility.js`
- `src/legacy/commands/cleanup-empty-categories.js`
- `src/legacy/commands/cleanup-guest-roles.js`
- `src/legacy/commands/community-about.js`
- `src/legacy/commands/community-architect.js`
- `src/legacy/commands/community-roadmap.js`
- `src/legacy/commands/create-party.js`
- `src/legacy/commands/debug-permissions.js`
- `src/legacy/commands/dedupe-layout.js`
- `src/legacy/commands/deep-cleanup.js`
- `src/legacy/commands/dev-audit-commands.js`
- `src/legacy/commands/factory-reset-server.js`
- `src/legacy/commands/fix-game-category.js`
- `src/legacy/commands/forget-channel-rule.js`
- `src/legacy/commands/help-me-start.js`
- `src/legacy/commands/layout-doctor.js`
- `src/legacy/commands/learn-channel.js`
- `src/legacy/commands/linkguard-settings.js`
- `src/legacy/commands/linkguard-whitelist.js`
- `src/legacy/commands/lock.js`
- `src/legacy/commands/memberguard-release.js`
- `src/legacy/commands/memberguard-settings.js`
- `src/legacy/commands/memberguard-status.js`
- `src/legacy/commands/memory-list.js`
- `src/legacy/commands/move-channel.js`
- `src/legacy/commands/plan-cleanup.js`
- `src/legacy/commands/polish-server-design.js`
- `src/legacy/commands/rebuild-community-layout.js`
- `src/legacy/commands/rebuild-community-v3.js`
- `src/legacy/commands/rebuild-server.js`
- `src/legacy/commands/refresh-community-guide.js`
- `src/legacy/commands/rename-channel.js`
- `src/legacy/commands/repair-channel-permissions.js`
- `src/legacy/commands/restore-active-channels.js`
- `src/legacy/commands/role-settings.js`
- `src/legacy/commands/setup-channel-panels.js`
- `src/legacy/commands/setup-community-guide.js`
- `src/legacy/commands/setup-game.js`
- `src/legacy/commands/setup-roles.js`
- `src/legacy/commands/setup-server.js`
- `src/legacy/commands/setup-ticket.js`
- `src/legacy/commands/setup-voicehub.js`
- `src/legacy/commands/suggest-game.js`
- `src/legacy/commands/tempvoice-doctor.js`
- `src/legacy/commands/tempvoice-panel.js`
- `src/legacy/commands/tempvoice-settings.js`
- `src/legacy/commands/unlock.js`
- `src/legacy/commands/voice-leaderboard.js`
- `src/legacy/commands/voice-profile.js`
- `src/legacy/commands/voice-room-info.js`
- `src/legacy/commands/voice-status.js`
- `src/legacy/commands/welcome-settings.js`

## L3: Replaceable

These are old hooks/templates that should be replaced by the current event/router architecture.

- `src/legacy/events/channelDelete.js`
- `src/legacy/events/guildMemberUpdate.js`
- `src/legacy/permissions/permissionTemplates.js`

## L4: Removable / Deprecated

These have already been replaced or deprecated. Remove after one release window if no operator relies on them for inspection.

- `src/legacy/deprecated/services/community/channelMutationService.js`
- `src/legacy/deprecated/services/community/channelPanelService.js`
- `src/legacy/deprecated/services/community/legacyAnalysisCommandService.js`
- `src/legacy/deprecated/services/community/legacySetupService.js`

## Top 20 Burn-Down Candidates

1. `src/legacy/deprecated/services/community/channelMutationService.js` - remove after release window.
2. `src/legacy/deprecated/services/community/channelPanelService.js` - remove after release window.
3. `src/legacy/deprecated/services/community/legacyAnalysisCommandService.js` - remove after release window.
4. `src/legacy/deprecated/services/community/legacySetupService.js` - remove after release window.
5. `src/legacy/events/channelDelete.js` - replace with main event registry coverage.
6. `src/legacy/events/guildMemberUpdate.js` - replace with main event registry coverage.
7. `src/legacy/permissions/permissionTemplates.js` - migrate constants into permission matrix.
8. `src/legacy/commands/community-about.js` - convert to `/community about` route handler.
9. `src/legacy/commands/community-roadmap.js` - convert to `/community roadmap` route handler.
10. `src/legacy/commands/refresh-community-guide.js` - convert to community guide service handler.
11. `src/legacy/commands/check-onboarding-visibility.js` - merge into `/community check-guest`.
12. `src/legacy/commands/debug-permissions.js` - merge into `/dev debug-permissions`.
13. `src/legacy/commands/layout-doctor.js` - merge into `/community audit`.
14. `src/legacy/commands/dev-audit-commands.js` - merge into `/dev audit-commands`.
15. `src/legacy/commands/memberguard-status.js` - merge into `/security status`.
16. `src/legacy/commands/archive-inactive-games.js` - merge into `/game doctor` or remove with archive policy.
17. `src/legacy/commands/suggest-game.js` - keep alias only after `/game suggest` owns implementation.
18. `src/legacy/commands/fix-game-category.js` - keep alias only after `/game fix` owns implementation.
19. `src/legacy/commands/setup-voicehub.js` - keep alias only after `/voice hub` owns implementation.
20. `src/legacy/commands/setup-ticket.js` - merge into `/admin ticket`.

## Next Score Targets

- Remove direct Discord writes from `setupServerLegacy.js` and `setupTicketLegacy.js`.
- Replace `communityService -> legacy command` calls with real service functions.
- Split `interactionCreate.js` by interaction type behind the existing router.
