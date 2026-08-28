const { ChannelLifecycle, ChannelOwnership, ChannelPurpose } = require('../../../src/domain/community/channelGovernance');

const CREATE_KEYS = new Set(['channel:dev', 'channel:invest', 'channel:creator', 'channel:night', 'channel:bot_logs', 'channel:moderation']);
const COMPACT_KEYS = new Set(['channel:game:teamfight_tactics:chat_lfg', 'channel:game:overwatch_2:chat_lfg', 'channel:game:cs2:chat_lfg']);

function createProductionReviewSnapshot(desiredState) {
  const byKey = new Map(desiredState.resources.map((resource) => [resource.key, resource]));
  const categoryIdByKey = new Map(desiredState.resources.filter((resource) => resource.type === 'category').map((resource, index) => [resource.key, `category-${index}`]));
  const canonical = desiredState.resources
    .filter((resource) => !CREATE_KEYS.has(resource.key))
    .map((resource, index) => ({
      id: resource.type === 'category' ? categoryIdByKey.get(resource.key) : `managed-${index}`,
      name: COMPACT_KEYS.has(resource.key) ? '聊天與找隊友' : resource.displayName,
      type: resource.type,
      parentId: resource.parentKey ? categoryIdByKey.get(resource.parentKey) : null,
      parentCanonicalKey: resource.parentKey || null,
      canonicalKey: resource.key,
      purpose: resource.purpose,
      owner: resource.owner,
      lifecycle: resource.lifecycle,
      accessProfile: COMPACT_KEYS.has(resource.key) ? 'member_discussion' : resource.accessProfile,
      accessRoleKey: COMPACT_KEYS.has(resource.key) ? null : resource.accessRoleKey,
      permissionSummary: []
    }));
  const compactGames = ['teamfight_tactics', 'overwatch_2', 'cs2'];
  const voiceOnlyGames = ['gtfo', 'repo', 'project_zomboid'];
  const reviewDelete = [
    // Split legacy channels are intentionally unclassified: they require human migration review,
    // not an inferred canonical match based on a similarly named purpose.
    ...compactGames.flatMap((gameId) => ['聊天', '找隊友'].map((name, index) => ({ id: `legacy-${gameId}-${index}`, name, type: 'text', parentId: categoryIdByKey.get(`category:game:${gameId}`), parentCanonicalKey: `category:game:${gameId}`, canonicalKey: null, purpose: ChannelPurpose.UNKNOWN, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, migrationReviewReason: 'legacy_split_compact_game_layout_requires_review', permissionSummary: [] }))),
    ...voiceOnlyGames.flatMap((gameId) => ['聊天', '資訊'].map((name, index) => ({ id: `legacy-${gameId}-extra-${index}`, name, type: 'text', parentId: categoryIdByKey.get(`category:game:${gameId}`), parentCanonicalKey: `category:game:${gameId}`, canonicalKey: null, purpose: ChannelPurpose.UNKNOWN, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, migrationReviewReason: 'legacy_channel_not_in_voice_only_layout_requires_review', permissionSummary: [] })))
  ];
  const review = Array.from({ length: 67 }, (_, index) => ({ id: `custom-${index}`, name: index < 12 ? `自訂分類-${index + 1}` : `自訂頻道-${index + 1}`, type: index < 12 ? 'category' : index >= 62 ? 'voice' : 'text', parentId: index < 12 ? null : `custom-${index % 12}`, parentCanonicalKey: null, canonicalKey: null, purpose: 'unknown', owner: ChannelOwnership.USER_MANAGED, lifecycle: ChannelLifecycle.UNKNOWN, permissionSummary: [] }));
  return Object.freeze({ inventory: Object.freeze([...canonical, ...reviewDelete, ...review]), desiredState, knownCreateKeys: Object.freeze([...CREATE_KEYS]), categoryIdByKey, byKey });
}

module.exports = { createProductionReviewSnapshot };
