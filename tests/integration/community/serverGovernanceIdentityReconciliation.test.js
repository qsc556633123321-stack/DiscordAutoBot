const assert = require('node:assert/strict');
const { ROLES } = require('../../../src/domain/community/communityArchitectureV3');
const GAME_REGISTRY = require('../../../src/domain/games/gameRegistry');
const { getGameRoleKey, getGameRoleName } = require('../../../src/domain/games/gameAccessPolicy');
const { buildFullGuildDesiredState } = require('../../../src/domain/community/serverGovernanceDesiredState');
const { GovernanceAction, ChannelLifecycle, ChannelOwnership, ChannelPurpose } = require('../../../src/domain/community/channelGovernance');
const { createServerGovernanceIdentityResolver } = require('../../../src/infrastructure/discord/serverGovernanceIdentityResolver');
const { createServerGovernanceResourceIdentityPolicy } = require('../../../src/domain/community/serverGovernanceResourceIdentityPolicy');
const { createDiscordGuildChannelInventoryAdapter } = require('../../../src/infrastructure/discord/discordGuildChannelInventoryAdapter');
const { createServerGovernancePlan } = require('../../../src/application/community/createServerGovernancePlanUseCase');
const { createServerGovernanceExecutionUseCase, preflightGovernanceExecution } = require('../../../src/application/community/serverGovernanceExecutionUseCase');
const { ExecutionMode } = require('../../../src/domain/community/serverGovernanceExecutionPolicy');
const { createServerGovernanceExecutionFeature } = require('../../../src/composition/serverGovernanceExecutionFeature');
const { createProductionIdentityChannels, createProductionIdentityRoles } = require('../../fixtures/community/server-governance-production-identity-guild');

const desiredState = buildFullGuildDesiredState();
const roleNames = Object.freeze({ everyone: '@everyone', ...Object.fromEntries(ROLES.map((role) => [role.key, role.name])), ...Object.fromEntries(GAME_REGISTRY.map((game) => [getGameRoleKey(game.id), getGameRoleName(game)])) });
const channels = createProductionIdentityChannels(desiredState);
const roles = createProductionIdentityRoles(roleNames);
const guild = { ownerId: 'guild-owner-user', channels: { cache: new Map(channels.map((channel) => [channel.id, channel])) }, roles: { everyone: { id: 'everyone-role' }, cache: roles }, members: { me: { permissions: { has: () => true } } } };
const resolver = createServerGovernanceIdentityResolver({ desiredState, roleNames });
const resourceIdentityPolicy = createServerGovernanceResourceIdentityPolicy({ desiredState });
const adapter = createDiscordGuildChannelInventoryAdapter({ resolveGuild: async () => guild, classifyInventory: resourceIdentityPolicy.classifyInventory, classifyResource: (channel) => channel.id === 'runtime-voice' ? { owner: ChannelOwnership.MANAGED_RUNTIME, lifecycle: ChannelLifecycle.RUNTIME, purpose: ChannelPurpose.RUNTIME_VOICE, runtime: true } : {} });

void (async () => {
  const inventory = await adapter.readGuildInventory({ guildId: 'production-shaped' });
  const byId = new Map(inventory.map((resource) => [resource.id, resource]));
  const valorantChat = [...byId.values()].find((resource) => resource.parentCanonicalKey === 'category:game:valorant' && resource.name === '聊天');
  const apexChat = [...byId.values()].find((resource) => resource.parentCanonicalKey === 'category:game:apex' && resource.name === '聊天');
  assert.equal(valorantChat.canonicalKey, 'channel:game:valorant:chat');
  assert.equal(apexChat.canonicalKey, 'channel:game:apex:chat');
  assert.notEqual(valorantChat.canonicalKey, apexChat.canonicalKey);
  assert.equal([...byId.values()].find((resource) => resource.name === '建立語音' && resource.parentCanonicalKey === 'category:game:valorant').canonicalKey, 'channel:game:valorant:voice_entry');
  assert.equal(byId.get('runtime-voice').canonicalKey, null);
  assert.equal(byId.get('runtime-voice').owner, ChannelOwnership.MANAGED_RUNTIME);

  const plan = createServerGovernancePlan({ inventory, desiredState });
  assert.equal(plan.actions.filter((action) => action.reason === 'ambiguous_duplicate_identity').length, 0);
  assert.equal(plan.actions.filter((action) => action.action === GovernanceAction.SAFE_DELETE && ['runtime-voice', 'unknown-user'].includes(action.resourceId)).length, 0);
  assert.equal(plan.actions.filter((action) => action.action === GovernanceAction.REVIEW && action.resourceId === 'unknown-user').length, 1);

  const rolesByKey = resolver.resolveRolesByKey(guild);
  assert.equal(rolesByKey.owner, 'guild-owner-user');
  assert.deepEqual(rolesByKey.admin, ['ops-admin']);
  assert.notEqual(rolesByKey.mod, rolesByKey.admin[0]);
  assert.equal(typeof rolesByKey['game:valorant'], 'string');
  const missingAdmin = preflightGovernanceExecution({ approvedPlan: { operations: [], blockedActions: [] }, snapshot: { guildExists: true, permissions: { ManageChannels: true, ManageRoles: true, ViewChannel: true }, rolesByKey: { ...rolesByKey, admin: undefined }, inventory }, requiredRoleKeys: ['owner', 'admin', 'mod', 'game:valorant'] });
  assert.equal(missingAdmin.reasons.includes('MISSING_ROLE:admin'), true);
  const writes = [];
  const gateway = { readExecutionSnapshot: async () => ({ guildExists: true, permissions: { ManageChannels: true, ManageRoles: true, ViewChannel: true }, rolesByKey, inventory }), createCategory: async () => writes.push('createCategory'), createTextChannel: async () => writes.push('createTextChannel'), createVoiceChannel: async () => writes.push('createVoiceChannel'), moveChannel: async () => writes.push('move'), renameChannel: async () => writes.push('rename'), applyCategoryPermissions: async () => writes.push('categoryPermission'), applyChannelPermissions: async () => writes.push('channelPermission'), deleteChannel: async () => writes.push('deleteChannel'), deleteCategory: async () => writes.push('deleteCategory') };
  const approvedPlan = { actions: plan.actions.filter((action) => ![GovernanceAction.REVIEW, GovernanceAction.REVIEW_DELETE, GovernanceAction.CONFLICT].includes(action.action)) };
  const execution = await createServerGovernanceExecutionUseCase({ mutationGateway: gateway, desiredState }).execute({ guildId: 'production-shaped', plan: approvedPlan, inventory, mode: ExecutionMode.DRY_RUN });
  assert.equal(execution.preflight.reasons.includes('MISSING_ROLE:owner'), false);
  assert.equal(execution.preflight.reasons.includes('MISSING_ROLE:admin'), false);
  assert.equal(writes.length, 0);

  const duplicateInventory = [...inventory, { ...valorantChat, id: 'duplicate-valorant-chat' }];
  const duplicatePlan = createServerGovernancePlan({ inventory: duplicateInventory, desiredState });
  assert.equal(duplicatePlan.actions.filter((action) => action.targetKey === 'channel:game:valorant:chat' && action.reason === 'ambiguous_duplicate_identity').length, 1);

  const compactCategory = [...byId.values()].find((resource) => resource.canonicalKey === 'category:game:teamfight_tactics');
  const voiceOnlyCategory = [...byId.values()].find((resource) => resource.canonicalKey === 'category:game:gtfo');
  const legacyLayoutChannels = [
    { id: 'compact-chat', name: '聊天', type: 'text', parentId: compactCategory.id, position: 0, permissionOverwrites: { cache: new Map() }, managed: false },
    { id: 'compact-lfg', name: '找隊友', type: 'text', parentId: compactCategory.id, position: 1, permissionOverwrites: { cache: new Map() }, managed: false },
    { id: 'voice-only-chat', name: '聊天', type: 'text', parentId: voiceOnlyCategory.id, position: 2, permissionOverwrites: { cache: new Map() }, managed: false }
  ];
  const legacyClassifications = resourceIdentityPolicy.classifyInventory([...channels, ...legacyLayoutChannels].map((channel) => ({ id: channel.id, name: channel.name, type: channel.type, parentId: channel.parentId })), {});
  assert.equal(legacyClassifications['compact-chat'].migrationReviewReason, 'legacy_split_compact_game_layout_requires_review');
  assert.equal(legacyClassifications['compact-lfg'].migrationReviewReason, 'legacy_split_compact_game_layout_requires_review');
  assert.equal(legacyClassifications['voice-only-chat'].migrationReviewReason, 'legacy_channel_not_in_voice_only_layout_requires_review');

  const productionFeature = createServerGovernanceExecutionFeature({ resolveGuild: async () => guild });
  const productionInventory = await productionFeature.readGuildInventory({ guildId: 'production-shaped' });
  const productionPlan = createServerGovernancePlan({ inventory: productionInventory, desiredState });
  const productionApprovedPlan = { actions: productionPlan.actions.filter((action) => ![GovernanceAction.REVIEW, GovernanceAction.REVIEW_DELETE, GovernanceAction.CONFLICT].includes(action.action)) };
  const productionDryRun = await productionFeature.serverGovernanceExecution.execute({ guildId: 'production-shaped', plan: productionApprovedPlan, inventory: productionInventory, mode: ExecutionMode.DRY_RUN });
  assert.equal(productionDryRun.preflight.reasons.includes('MISSING_ROLE:owner'), false);
  assert.equal(productionDryRun.preflight.reasons.includes('MISSING_ROLE:admin'), false);
  assert.equal(productionDryRun.results.every((result) => result.dryRun === true), true);
  console.log('Server governance production identity reconciliation tests passed.');
})();
