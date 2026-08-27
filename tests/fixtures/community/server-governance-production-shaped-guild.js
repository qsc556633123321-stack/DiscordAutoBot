const { ChannelLifecycle, ChannelOwnership, ChannelPurpose } = require('../../../src/domain/community/channelGovernance');

function createProductionShapedGuildInventory(desiredState) {
  const canonical = desiredState.resources.map((resource, index) => ({ id: `canonical-${index}`, name: resource.displayName, type: resource.type, parentId: null, parentCanonicalKey: resource.parentKey || null, canonicalKey: resource.key, purpose: resource.purpose, owner: resource.owner, lifecycle: resource.lifecycle, accessProfile: resource.accessProfile, accessRoleKey: resource.accessRoleKey, permissionSummary: [] }));
  const target = canonical.find((resource) => resource.canonicalKey === 'channel:game_lfg');
  target.name = '組隊專區';
  target.parentCanonicalKey = 'category:community';
  target.accessProfile = 'member_discussion';
  return Object.freeze([...canonical,
    { id: 'legacy-duplicate', name: '📢｜組隊招募', type: 'text', parentCanonicalKey: 'category:game_center', canonicalKey: null, purpose: ChannelPurpose.GAME_LFG, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, replacementKey: 'channel:game_lfg', permissionSummary: [] },
    { id: 'unknown-user', name: '我的私人角落', type: 'text', parentCanonicalKey: null, canonicalKey: null, purpose: ChannelPurpose.UNKNOWN, owner: ChannelOwnership.USER_MANAGED, lifecycle: ChannelLifecycle.UNKNOWN, permissionSummary: [] },
    { id: 'runtime-voice', name: 'Temp Voice #1', type: 'voice', parentCanonicalKey: null, canonicalKey: null, purpose: ChannelPurpose.RUNTIME_VOICE, owner: ChannelOwnership.MANAGED_RUNTIME, lifecycle: ChannelLifecycle.RUNTIME, permissionSummary: [] },
    { id: 'ticket-1', name: 'ticket-123', type: 'text', parentCanonicalKey: null, canonicalKey: null, purpose: ChannelPurpose.TICKET, owner: ChannelOwnership.SYSTEM_PROTECTED, lifecycle: ChannelLifecycle.RUNTIME, permissionSummary: [] },
    { id: 'obsolete-category', name: '舊分類', type: 'category', parentCanonicalKey: null, canonicalKey: null, purpose: ChannelPurpose.UNKNOWN, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, replacementKey: 'category:community', permissionSummary: [] }
  ]);
}
module.exports = { createProductionShapedGuildInventory };
