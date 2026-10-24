const { getGameId } = require('../games/gameIdentityService');

const DiffAction = Object.freeze({ KEEP: 'KEEP', RENAME: 'RENAME', MOVE: 'MOVE', CREATE: 'CREATE', PERMISSION_REVIEW: 'PERMISSION_REVIEW', DUPLICATE_REVIEW: 'DUPLICATE_REVIEW', DELETE_CANDIDATE: 'DELETE_CANDIDATE' });

function stable(items) { return [...items].sort((left, right) => `${left.action}:${left.targetKey || left.channelId || ''}`.localeCompare(`${right.action}:${right.targetKey || right.channelId || ''}`)); }
function compareCommunityLayout({ snapshot = {}, schema = { resources: [] }, channelBindings = [] } = {}) {
  const resources = [...(snapshot.categories || []), ...(snapshot.channels || [])];
  const byId = new Map(resources.map((channel) => [channel.id, channel]));
  const bindings = new Map(channelBindings.map((binding) => [binding.canonicalKey, binding]));
  const canonicalKeyByChannelId = new Map(channelBindings.map((binding) => [binding.discordChannelId, binding.canonicalKey]));
  const actions = [];
  const claimed = new Set();
  for (const target of schema.resources || []) {
    const binding = bindings.get(target.key);
    const channel = binding ? byId.get(binding.discordChannelId) : null;
    if (!channel && binding) { actions.push({ action: DiffAction.DUPLICATE_REVIEW, targetKey: target.key, reason: 'bound_channel_missing', risk: 'high' }); continue; }
    if (!channel) { actions.push({ action: DiffAction.CREATE, targetKey: target.key, reason: 'no_verified_id_binding', risk: 'medium' }); continue; }
    claimed.add(channel.id);
    if (channel.name !== target.displayName) actions.push({ action: DiffAction.RENAME, channelId: channel.id, targetKey: target.key, reason: 'verified_binding_name_mismatch', risk: 'low' });
    const parentCanonicalKey = canonicalKeyByChannelId.get(channel.parentId) || null;
    if (parentCanonicalKey !== (target.parentKey || null)) actions.push({ action: DiffAction.MOVE, channelId: channel.id, targetKey: target.key, reason: 'verified_binding_parent_mismatch', risk: 'medium' });
    if (channel.accessProfile && channel.accessProfile !== target.accessProfile) actions.push({ action: DiffAction.PERMISSION_REVIEW, channelId: channel.id, targetKey: target.key, reason: 'permission_profile_mismatch', risk: 'high' });
    if (!actions.some((item) => item.channelId === channel.id)) actions.push({ action: DiffAction.KEEP, channelId: channel.id, targetKey: target.key, reason: 'verified_binding_matches', risk: 'none' });
  }
  for (const channel of resources.filter((item) => !claimed.has(item.id))) {
    const canonicalGameId = channel.gameName ? getGameId(channel.gameName) : null;
    actions.push({ action: DiffAction.DELETE_CANDIDATE, channelId: channel.id, canonicalGameId, reason: 'unbound_channel_requires_human_review', risk: 'high' });
  }
  return Object.freeze({ actions: Object.freeze(stable(actions)) });
}
module.exports = { DiffAction, compareCommunityLayout };
