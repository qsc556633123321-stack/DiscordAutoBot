const assert = require('node:assert/strict');
const { ChannelOwnership } = require('../../../src/domain/community/channelGovernance');
const { buildFullGuildGovernancePreview, createFullGuildGovernancePreviewUseCase } = require('../../../src/application/community/createServerGovernancePlanUseCase');
const desiredState = { resources: [Object.freeze({ key: 'category:entry', displayName: 'Entry', type: 'category', purpose: 'entry', parentKey: null, accessProfile: 'public_entry', accessRoleKey: null, legacyNames: [], owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: 'persistent' })] };
const base = { id: 'entry', name: 'Entry', type: 'category', canonicalKey: 'category:entry', parentCanonicalKey: null, purpose: 'entry', accessProfile: 'public_entry', accessRoleKey: null, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: 'persistent' };
const preview = buildFullGuildGovernancePreview({ inventory: [base, { id: 'duplicate', name: 'legacy', type: 'category', canonicalKey: null, parentCanonicalKey: null, purpose: 'unknown', accessProfile: null, accessRoleKey: null, owner: 'UNKNOWN', lifecycle: 'unknown' }, { id: 'temp', name: 'temp', type: 'voice', purpose: 'runtime_voice', owner: 'MANAGED_RUNTIME', lifecycle: 'runtime' }], desiredState });
assert.equal(preview.summary.keep, 2);
assert.equal(preview.summary.protected, 1);
assert.equal(preview.summary.review, 1);
assert.equal(preview.summary.totals.currentResources, 3);
assert.equal(preview.projectedTree[0].displayName, 'Entry');
assert.equal(preview.permissionPreview[0].accessProfile, 'public_entry');
void (async () => {
  const useCase = createFullGuildGovernancePreviewUseCase({ inventoryPort: { async readGuildInventory() { return [base]; } }, desiredState });
  assert.equal((await useCase.previewFullGuildGovernance({ guildId: 'g1' })).summary.keep, 1);
  console.log('Full server governance preview application tests passed.');
})();
