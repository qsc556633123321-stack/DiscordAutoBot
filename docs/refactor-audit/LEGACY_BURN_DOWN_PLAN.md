# Legacy Burn-down Plan

Generated: 2026-07-23T14:25:51.590Z

The ordering is migration order, not deletion authorization. Every wave preserves public commands and runtime behavior until its tests and release-window checks pass.

## Completed Migrations: Wrapper Remaining

| Module | Status | Replacement path | Release-window action |
| --- | --- | --- | --- |
| src/legacy/commands/check-onboarding-visibility.js | Migrated; wrapper remaining | src/presentation/commands/checkOnboardingVisibilityCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/community-about.js | Migrated; wrapper remaining | src/presentation/commands/communityAboutCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/community-roadmap.js | Migrated; wrapper remaining | src/presentation/commands/communityRoadmapCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/help-me-start.js | Migrated; wrapper remaining | src/presentation/commands/helpMeStartCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/dev-audit-commands.js | Migrated; wrapper remaining | src/presentation/commands/devAuditCommandsCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/forget-channel-rule.js | Migrated; wrapper remaining | src/presentation/commands/forgetChannelRuleCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/learn-channel.js | Migrated; wrapper remaining | src/presentation/commands/learnChannelCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/memberguard-release.js | Migrated; wrapper remaining | src/presentation/commands/memberguardReleaseCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/memberguard-settings.js | Migrated; wrapper remaining | src/presentation/commands/memberguardSettingsCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/memberguard-status.js | Migrated; wrapper remaining | src/presentation/commands/memberGuardStatusCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/commands/memory-list.js | Migrated; wrapper remaining | src/presentation/commands/memoryListCommand.js | keep wrapper and monitor before legacy deletion review |
| src/legacy/systemRuntimes/organizerRuntime.js | Migrated; legacy source retained | src/systems/organizer.js -> src/composition/organizerFeature.js -> organizer planning use case | keep wrapper and monitor before legacy deletion review |

## Wave 1: low-risk, clear boundary

| Module | Preconditions | Required tests | Done definition | Rollback | Impact |
| --- | --- | --- | --- | --- | --- |
| src/legacy/deprecated/services/community/channelMutationService.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | low after release-window verification |
| src/legacy/deprecated/services/community/channelPanelService.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | low after release-window verification |
| src/legacy/deprecated/services/community/legacyAnalysisCommandService.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | low after release-window verification |
| src/legacy/deprecated/services/community/legacySetupService.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | low after release-window verification |

## Wave 2: existing service replacement with fallback

| Module | Preconditions | Required tests | Done definition | Rollback | Impact |
| --- | --- | --- | --- | --- | --- |
| src/legacy/systemRuntimes/factoryResetRuntime.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | medium |

## Wave 3: alias and interaction compatibility

| Module | Preconditions | Required tests | Done definition | Rollback | Impact |
| --- | --- | --- | --- | --- | --- |
| src/legacy/commands/ai-layout-repair.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/ai_reorganize_server.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/analyze_server.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/announce.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/announcement-pin-settings.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/apply-role-permissions.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/archive-inactive-games.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/auto_organize.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/automod-settings.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/bootstrap-community.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/check-guest-visibility.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/check-role-visibility.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/cleanup-empty-categories.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/cleanup-guest-roles.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/community-about.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/community-architect.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/community-roadmap.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/create-party.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/debug-permissions.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/dedupe-layout.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/deep_cleanup.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/factory-reset-server.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/fix-game-category.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/game-registry-doctor.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/layout-doctor.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/linkguard-settings.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/linkguard-whitelist.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/lock.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/move-channel.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/plan_cleanup.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/polish-server-design.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/rebuild-community-layout.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/rebuild-community-v3.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/rebuild_server.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/refresh-community-guide.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/rename-channel.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/repair-channel-permissions.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/restore-active-channels.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/role-settings.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setup-channel-panels.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setup-community-guide.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setup-game.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setup-roles.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setup-voicehub.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setupServerLegacy.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/setupTicketLegacy.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/suggest-game.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/tempvoice-doctor.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/tempvoice-panel.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/tempvoice-settings.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/unlock.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/voice-leaderboard.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/voice-profile.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/voice-room-info.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/voice-status.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/commands/welcome-settings.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/interactions/legacyInteractionDispatcher.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/interactions/legacyInteractionRuntime.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |

## Wave 4: community/layout/permission high-risk

| Module | Preconditions | Required tests | Done definition | Rollback | Impact |
| --- | --- | --- | --- | --- | --- |
| src/legacy/community/communityBootstrapSystem.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/community/serverPolisher.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/community/serverRebuilder.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | medium |
| src/legacy/layout/legacyLayoutDecisionEngine.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | unknown |
| src/legacy/layout/legacyLayoutRuntime.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/permissions/communityV3PermissionBuilder.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | medium |
| src/legacy/permissions/guestGate.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/permissions/permissionTemplates.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/permissions/rolePermissions.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |

## Wave 5: legacy events and final removal

| Module | Preconditions | Required tests | Done definition | Rollback | Impact |
| --- | --- | --- | --- | --- | --- |
| src/legacy/events/channelDelete.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |
| src/legacy/events/guildMemberUpdate.js | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | high |

## Hold: investigate before assigning a wave

| Module | Reason |
| --- | --- |
| src/legacy/commands/ai-reorganize-server.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/analyze-server.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/auto-organize.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/deep-cleanup.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/plan-cleanup.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/rebuild-server.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/setup-server.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/commands/setup-ticket.js | BOOT_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/games/gameChannels.js | COMPATIBILITY_WRAPPER, RUNTIME_REQUIRED; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/aiServerReorganizerRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/channelPanelsRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/communityV3BuilderRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/gameSuggestionSystemRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/linkGuardRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/organizerRuntime.js | REPLACEMENT_EXISTS, UNKNOWN_DYNAMIC_REFERENCE; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/roleManagerRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |
| src/legacy/systemRuntimes/tempVoiceRuntime.js | COMPATIBILITY_WRAPPER; do not schedule while runtime ownership is unclear. |

## Guardrails

- Never delete a legacy file in the same change that first redirects a runtime path.
- Preserve aliases until deploy metadata is intentionally changed in a dedicated release.
- Dynamic directory loaders require explicit registry updates before any removal.
- High-risk community, layout, permission, and interaction runtime migration needs behavior fixtures before redirecting the active path.

## Community Discovery Completion Note (2026-07-24)

`/help-me-start` is now migrated as a read-only slice with its thin wrapper retained. The Community Guide payload read-render slice is also migrated behind a compatibility payload delegation. Guide status, publication, role mutation, onboarding event work, panels, proposals, bootstrap/rebuild, and maintenance remain legacy/compatibility-owned until their dedicated fixtures and cross-feature boundaries are available.

Its 2026-07-24 cleanup kept the wrapper but moved the Concierge compatibility bridge into `src/adapters/legacy/`; no new allowlist entry is required.

The Guide read migration does not authorize removal of `setup-community-guide`, `refresh-community-guide`, or `communityConcierge` mutation behavior. The system remains during its observation window as the publish owner.

Community Mutation Runtime Discovery adds evidence for later ordering only. It does not move any mutation owner into a removal wave.
