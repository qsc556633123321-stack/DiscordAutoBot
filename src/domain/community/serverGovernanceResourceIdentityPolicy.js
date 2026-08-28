const { getGameId } = require('../games/gameIdentityService');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose } = require('./channelGovernance');

function normalizeStructureName(value = '') {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/^[^\p{Letter}\p{Number}]+[｜|]\s*/u, '')
    .toLowerCase()
    .replace(/\s+/gu, '');
}

function createServerGovernanceResourceIdentityPolicy({ desiredState = { resources: [] } } = {}) {
  const desired = desiredState.resources || [];
  const desiredByKey = new Map(desired.map((resource) => [resource.key, resource]));
  const categories = desired.filter((resource) => resource.type === 'category');
  const gameCategoryById = new Map(categories.filter((resource) => resource.key.startsWith('category:game:')).map((resource) => [resource.key.slice('category:game:'.length), resource]));

  function classificationFor(resource) {
    return Object.freeze({ canonicalKey: resource.key, parentCanonicalKey: resource.parentKey || null, purpose: resource.purpose, owner: resource.owner, lifecycle: resource.lifecycle, accessProfile: resource.accessProfile, accessRoleKey: resource.accessRoleKey, replacementKey: null });
  }

  function categoryMatch(resource) {
    const name = normalizeStructureName(resource.name);
    for (const category of categories) {
      const candidates = [category.displayName, ...(category.legacyNames || [])].map(normalizeStructureName);
      if (candidates.includes(name)) return category;
    }
    return gameCategoryById.get(getGameId(resource.name)) || null;
  }

  function legacyGameReview(resource, parent) {
    if (!parent?.key?.startsWith('category:game:')) return null;
    const gameChildren = desired.filter((item) => item.parentKey === parent.key);
    const normalized = normalizeStructureName(resource.name);
    const compact = gameChildren.some((item) => item.key.endsWith(':chat_lfg'));
    const voiceOnly = gameChildren.length === 1 && gameChildren[0].key.endsWith(':voice_entry');
    const split = ['聊天', '找隊友'].map(normalizeStructureName).includes(normalized);
    const extra = ['聊天', '找隊友', '資訊', '聊天與找隊友'].map(normalizeStructureName).includes(normalized);
    if (compact && split) return Object.freeze({ purpose: normalized === normalizeStructureName('聊天') ? ChannelPurpose.GAME_CHAT : ChannelPurpose.GAME_LFG, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, migrationReviewReason: 'legacy_split_compact_game_layout_requires_review' });
    if (voiceOnly && extra) return Object.freeze({ purpose: ChannelPurpose.GAME_CHAT, owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, migrationReviewReason: 'legacy_channel_not_in_voice_only_layout_requires_review' });
    return null;
  }

  function classifyInventory(resources = [], stableClassifications = {}) {
    const categoriesById = new Map();
    for (const resource of resources) {
      if (resource.type !== 'category') continue;
      const stable = stableClassifications[resource.id] || {};
      const target = stable.canonicalKey ? desiredByKey.get(stable.canonicalKey) : categoryMatch(resource);
      if (target) categoriesById.set(resource.id, target);
    }
    const result = {};
    for (const resource of resources) {
      const stable = stableClassifications[resource.id] || {};
      if (stable.canonicalKey && desiredByKey.has(stable.canonicalKey)) {
        result[resource.id] = classificationFor(desiredByKey.get(stable.canonicalKey));
        continue;
      }
      if (resource.type === 'category') {
        const target = categoriesById.get(resource.id);
        if (target) result[resource.id] = classificationFor(target);
        continue;
      }
      const parent = categoriesById.get(resource.parentId);
      if (!parent) continue;
      const candidates = desired.filter((item) => item.parentKey === parent.key && item.type === resource.type && [item.displayName, ...(item.legacyNames || [])].map(normalizeStructureName).includes(normalizeStructureName(resource.name)));
      if (candidates.length === 1) {
        result[resource.id] = classificationFor(candidates[0]);
        continue;
      }
      const review = legacyGameReview(resource, parent);
      if (review) result[resource.id] = Object.freeze({ parentCanonicalKey: parent.key, ...review });
    }
    return Object.freeze(result);
  }

  return Object.freeze({ classifyInventory });
}

module.exports = { createServerGovernanceResourceIdentityPolicy, normalizeStructureName };
