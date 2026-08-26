const assert = require('node:assert/strict');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose, GovernanceAction, PermissionProfile, createGovernedResource } = require('../../../src/domain/community/channelGovernance');
const { ExecutionMode } = require('../../../src/domain/community/serverGovernanceExecutionPolicy');
const { createServerGovernanceExecutionUseCase, prepareGovernanceExecutionPlan, preflightGovernanceExecution } = require('../../../src/application/community/serverGovernanceExecutionUseCase');

const category = createGovernedResource({ key: 'category:games', displayName: 'Games', type: 'category', purpose: ChannelPurpose.GAME_CENTER, owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile: PermissionProfile.GAME_CENTER, lifecycle: ChannelLifecycle.PERSISTENT, deletePolicy: 'managed_only' });
const channel = createGovernedResource({ key: 'channel:games:info', displayName: 'Info', type: 'text', parentKey: category.key, purpose: ChannelPurpose.GAME_INFO, owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile: PermissionProfile.READONLY_INFO, lifecycle: ChannelLifecycle.PERSISTENT, deletePolicy: 'managed_only' });
const stale = { id: 'old', name: 'Old', type: 'text', parentId: 'parent', parentCanonicalKey: category.key, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.PERSISTENT, purpose: ChannelPurpose.GAME_INFO, permissionSummary: [] };
const desiredState = { resources: [category, channel] };
function allRoles() { return { member: 'member', game: 'game', owner: 'owner', admin: 'admin', mod: 'mod' }; }
function gateway({ snapshot = null, fail = null } = {}) {
  const calls = [];
  const live = snapshot || { guildExists: true, permissions: { ManageChannels: true, ManageRoles: true, ViewChannel: true }, rolesByKey: allRoles(), inventory: [stale] };
  const write = (name) => async () => { calls.push(name); if (fail === name) throw new Error(name); };
  return { calls, readExecutionSnapshot: async () => live, createCategory: write('createCategory'), createTextChannel: write('createTextChannel'), createVoiceChannel: write('createVoiceChannel'), moveChannel: write('moveChannel'), renameChannel: write('renameChannel'), applyCategoryPermissions: write('applyCategoryPermissions'), applyChannelPermissions: write('applyChannelPermissions'), deleteChannel: write('deleteChannel'), deleteCategory: write('deleteCategory') };
}
const plan = { actions: [
  { action: GovernanceAction.CREATE, targetKey: category.key, reason: 'missing' },
  { action: GovernanceAction.MOVE, resourceId: 'old', targetKey: channel.key, reason: 'move' },
  { action: GovernanceAction.RENAME, resourceId: 'old', targetKey: channel.key, reason: 'rename' },
  { action: GovernanceAction.PERMISSION_CHANGE, resourceId: 'old', targetKey: channel.key, reason: 'permission' },
  { action: GovernanceAction.SAFE_DELETE, resourceId: 'old', targetKey: channel.key, reason: 'duplicate' }
] };
void (async () => {
  const prepared = prepareGovernanceExecutionPlan({ plan, desiredState, inventory: [stale] });
  assert.deepEqual(prepared.operations.map((item) => item.type), [GovernanceAction.CREATE, GovernanceAction.MOVE, GovernanceAction.RENAME, GovernanceAction.PERMISSION_CHANGE, GovernanceAction.SAFE_DELETE]);
  const dry = gateway();
  const result = await createServerGovernanceExecutionUseCase({ mutationGateway: dry, desiredState }).execute({ guildId: 'g1', plan, inventory: [stale], mode: ExecutionMode.DRY_RUN });
  assert.equal(result.preflight.ok, true);
  assert.equal(dry.calls.length, 0);
  assert.equal(result.results.length, 5);
  assert.equal(result.results[3].permission.overwrites.some((item) => item.roleKey === 'everyone' && item.deny.includes('ViewChannel')), true);
  const live = gateway();
  const executed = await createServerGovernanceExecutionUseCase({ mutationGateway: live, desiredState }).execute({ guildId: 'g1', plan, inventory: [stale], mode: ExecutionMode.EXECUTE });
  assert.deepEqual(live.calls, ['createCategory', 'moveChannel', 'renameChannel', 'applyChannelPermissions', 'deleteChannel']);
  assert.equal(executed.summary.deletedChannels, 1);
  const denied = gateway({ snapshot: { guildExists: true, permissions: { ManageChannels: false, ManageRoles: true, ViewChannel: true }, rolesByKey: allRoles(), inventory: [stale] } });
  const deniedResult = await createServerGovernanceExecutionUseCase({ mutationGateway: denied, desiredState }).execute({ guildId: 'g1', plan, inventory: [stale] });
  assert.equal(deniedResult.preflight.ok, false);
  assert.equal(denied.calls.length, 0);
  const staleSnapshot = gateway({ snapshot: { guildExists: true, permissions: { ManageChannels: true, ManageRoles: true, ViewChannel: true }, rolesByKey: allRoles(), inventory: [{ ...stale, name: 'Manually changed' }] } });
  const staleResult = await createServerGovernanceExecutionUseCase({ mutationGateway: staleSnapshot, desiredState }).execute({ guildId: 'g1', plan, inventory: [stale] });
  assert.equal(staleResult.preflight.reasons.some((reason) => reason.startsWith('STALE_PLAN:')), true);
  assert.equal(staleSnapshot.calls.length, 0);
  const review = preflightGovernanceExecution({ approvedPlan: { ...prepared, blockedActions: [{ action: GovernanceAction.REVIEW }] }, snapshot: { guildExists: true, permissions: { ManageChannels: true, ManageRoles: true, ViewChannel: true }, rolesByKey: allRoles(), inventory: [stale] }, requiredRoleKeys: [] });
  assert.equal(review.ok, false);
  console.log('Server governance execution application tests passed.');
})();
