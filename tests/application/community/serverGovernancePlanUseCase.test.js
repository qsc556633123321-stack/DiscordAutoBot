const assert = require('node:assert/strict');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose, PermissionProfile, createGovernedResource } = require('../../../src/domain/community/channelGovernance');
const { createServerGovernancePlan, createServerGovernancePlanUseCase } = require('../../../src/application/community/createServerGovernancePlanUseCase');

const desired = createGovernedResource({ key: 'category:entry', displayName: '📌｜社群入口', type: 'category', purpose: ChannelPurpose.ENTRY, owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile: PermissionProfile.PUBLIC_ENTRY, lifecycle: ChannelLifecycle.PERSISTENT, deletePolicy: 'managed_only', legacyNames: ['社群入口'] });
const base = { id: '1', name: desired.displayName, type: 'category', canonicalKey: desired.key, parentCanonicalKey: null, purpose: desired.purpose, accessProfile: desired.accessProfile, accessRoleKey: null, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.PERSISTENT };
function actions(inventory) { return createServerGovernancePlan({ inventory, desiredState: { resources: [desired] } }).actions; }
assert.equal(actions([base])[0].action, 'KEEP');
assert.equal(actions([{ ...base, parentCanonicalKey: 'category:wrong' }])[0].action, 'MOVE');
assert.equal(actions([{ ...base, name: '入口' }])[0].action, 'RENAME');
assert.equal(actions([])[0].action, 'CREATE');
assert.equal(actions([{ ...base, accessProfile: 'member_discussion' }])[0].action, 'PERMISSION_CHANGE');
assert.equal(actions([base, { ...base, id: 'legacy', canonicalKey: null, name: '社群入口' }]).some((item) => item.action === 'SAFE_DELETE'), true);
assert.equal(actions([{ ...base, id: 'unknown', canonicalKey: null, name: '玩家自建', purpose: 'unknown', owner: ChannelOwnership.USER_MANAGED }]).some((item) => item.action === 'REVIEW'), true);
assert.equal(actions([{ id: 'temp', name: 'temp', type: 'voice', purpose: 'runtime_voice', owner: ChannelOwnership.MANAGED_RUNTIME, lifecycle: 'runtime' }]).some((item) => item.action === 'KEEP'), true);
assert.equal(actions([{ id: 'ticket', name: 'ticket', type: 'text', purpose: 'ticket', owner: ChannelOwnership.SYSTEM_PROTECTED, lifecycle: 'persistent' }]).some((item) => item.action === 'KEEP'), true);
assert.equal(actions([base, { ...base, id: 'ambiguous', canonicalKey: desired.key }]).some((item) => item.action === 'CONFLICT'), true);
assert.equal(actions([{ id: 'quiet', name: 'quiet', type: 'text', purpose: 'unknown', owner: ChannelOwnership.UNKNOWN, lifecycle: 'unknown', activityDays: 30 }]).some((item) => item.action === 'SAFE_DELETE'), false);
assert.equal(actions([]).some((item) => /ARCHIVE/.test(item.action)), false);
void (async () => {
  const useCase = createServerGovernancePlanUseCase({ inventoryPort: { async readGuildInventory({ guildId }) { assert.equal(guildId, 'g1'); return [base]; } }, desiredState: { resources: [desired] } });
  assert.equal((await useCase.previewGuildGovernance({ guildId: 'g1' })).actions[0].action, 'KEEP');
  console.log('Server governance planner tests passed.');
})();
