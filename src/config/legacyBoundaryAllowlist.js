// Exact, temporary compatibility edges. New production code must not add an
// edge here without a migration reason and a removal target.
const entries = [
  ['src/adapters/legacy/legacyCommunityCommandExecutor.js', 'src/legacy/commands/analyze_server.js', 'Legacy community command adapter.'],
  ['src/adapters/legacy/legacyCommunityCommandExecutor.js', 'src/legacy/commands/ai_reorganize_server.js', 'Legacy community command adapter.'],
  ['src/adapters/legacy/legacyCommunityCommandExecutor.js', 'src/legacy/commands/auto_organize.js', 'Legacy community command adapter.'],
  ['src/adapters/legacy/legacyCommunityCommandExecutor.js', 'src/legacy/commands/deep_cleanup.js', 'Legacy community command adapter.'],
  ['src/adapters/legacy/legacyCommunityCommandExecutor.js', 'src/legacy/commands/plan_cleanup.js', 'Legacy community command adapter.'],
  ['src/adapters/legacy/legacyCommunityCommandExecutor.js', 'src/legacy/commands/rebuild_server.js', 'Legacy community command adapter.'],
  ['src/config/permissionTemplates.js', 'src/legacy/permissions/permissionTemplates.js', 'Legacy permission template facade.'],
  ['src/infrastructure/discord/onboardingVisibilityGateway.js', 'src/legacy/community/communityBootstrapSystem.js', 'Phase 3 onboarding inspection gateway; behavior remains legacy-owned.'],
  ['src/modules/interactions/autocompleteInteractionHandler.js', 'src/legacy/interactions/legacyInteractionDispatcher.js', 'Unmigrated autocomplete compatibility fallback.'],
  ['src/modules/interactions/buttonInteractionHandler.js', 'src/legacy/interactions/legacyInteractionDispatcher.js', 'Unmatched button compatibility fallback.'],
  ['src/modules/interactions/modalInteractionHandler.js', 'src/legacy/interactions/legacyInteractionDispatcher.js', 'Unmigrated modal compatibility fallback.'],
  ['src/modules/interactions/selectMenuInteractionHandler.js', 'src/legacy/interactions/legacyInteractionDispatcher.js', 'Unmigrated select-menu compatibility fallback.'],
  ['src/modules/interactions/slashInteractionHandler.js', 'src/legacy/interactions/legacyInteractionDispatcher.js', 'Unmapped alias compatibility fallback.'],
  ['src/modules/interactions/buttonHandlers/adminButtons.js', 'src/legacy/interactions/legacyInteractionRuntime.js', 'Admin button behavior has not migrated.'],
  ['src/modules/interactions/buttonHandlers/gameButtons.js', 'src/legacy/interactions/legacyInteractionRuntime.js', 'Game button behavior has not migrated.'],
  ['src/modules/interactions/buttonHandlers/panelButtons.js', 'src/legacy/interactions/legacyInteractionRuntime.js', 'Panel button behavior has not migrated.'],
  ['src/modules/interactions/buttonHandlers/roleButtons.js', 'src/legacy/interactions/legacyInteractionRuntime.js', 'Role button behavior has not migrated.'],
  ['src/modules/interactions/buttonHandlers/voiceButtons.js', 'src/legacy/interactions/legacyInteractionRuntime.js', 'Voice button behavior has not migrated.'],
  ['src/modules/layout/layoutDecisionEngine.js', 'src/legacy/layout/legacyLayoutDecisionEngine.js', 'High-risk layout rules remain a measured fallback.'],
  ['src/services/community/communityPermissionService.js', 'src/legacy/permissions/guestGate.js', 'Permission migration is incomplete; use the established compatibility facade.'],
  ['src/services/community/communityPermissionService.js', 'src/legacy/permissions/rolePermissions.js', 'Permission migration is incomplete; use the established compatibility facade.'],
  ['src/services/community/communityRebuildService.js', 'src/legacy/community/communityBootstrapSystem.js', 'Community rebuild behavior remains legacy-owned.'],
  ['src/services/community/communityRebuildService.js', 'src/legacy/community/serverPolisher.js', 'Community polish behavior remains legacy-owned.'],
  ['src/services/games/gameCategoryService.js', 'src/legacy/games/gameChannels.js', 'Game channel creation behavior remains legacy-owned.'],
  ['src/systems/aiServerReorganizer.js', 'src/legacy/systemRuntimes/aiServerReorganizerRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/channelPanels.js', 'src/legacy/systemRuntimes/channelPanelsRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/communityBootstrapSystem.js', 'src/legacy/community/communityBootstrapSystem.js', 'Legacy compatibility facade.'],
  ['src/systems/communityV3Builder.js', 'src/legacy/systemRuntimes/communityV3BuilderRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/communityV3PermissionBuilder.js', 'src/legacy/permissions/communityV3PermissionBuilder.js', 'Legacy compatibility facade.'],
  ['src/systems/factoryReset.js', 'src/legacy/systemRuntimes/factoryResetRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/gameChannels.js', 'src/legacy/games/gameChannels.js', 'Legacy compatibility facade.'],
  ['src/systems/gameSuggestionSystem.js', 'src/legacy/systemRuntimes/gameSuggestionSystemRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/guestGate.js', 'src/legacy/permissions/guestGate.js', 'Legacy compatibility facade.'],
  ['src/systems/linkGuard.js', 'src/legacy/systemRuntimes/linkGuardRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/roleManager.js', 'src/legacy/systemRuntimes/roleManagerRuntime.js', 'Legacy runtime wrapper pending a future migration.'],
  ['src/systems/rolePermissions.js', 'src/legacy/permissions/rolePermissions.js', 'Legacy compatibility facade.'],
  ['src/systems/serverPolisher.js', 'src/legacy/community/serverPolisher.js', 'Legacy compatibility facade.'],
  ['src/systems/serverRebuilder.js', 'src/legacy/community/serverRebuilder.js', 'Legacy compatibility facade.'],
  ['src/systems/tempVoice.js', 'src/legacy/systemRuntimes/tempVoiceRuntime.js', 'Legacy runtime wrapper pending a future migration.']
];

const allowedEdges = new Map(entries.map(([from, to, reason]) => [`${from}->${to}`, reason]));

function getLegacyBoundaryAllowance(from, to) {
  return allowedEdges.get(`${from}->${to}`) || null;
}

module.exports = { entries, getLegacyBoundaryAllowance };
