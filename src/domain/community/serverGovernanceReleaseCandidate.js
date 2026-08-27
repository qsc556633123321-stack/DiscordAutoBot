const { ChannelPurpose } = require('./channelGovernance');
const { canRoleKeysAccessResource } = require('./serverGovernanceAccessPolicy');
const { getGameLayoutProfile } = require('../games/gameLayoutProfiles');

function buildProjectedGuildStats(desiredState = {}, gameRegistry = []) {
  const resources = desiredState.resources || [];
  const categories = resources.filter((resource) => resource.type === 'category');
  const channels = resources.filter((resource) => resource.type !== 'category');
  const layouts = gameRegistry.reduce((total, game) => ({ ...total, [game.layoutProfile]: (total[game.layoutProfile] || 0) + 1 }), { full: 0, compact: 0, voice_only: 0 });
  const gameChannels = gameRegistry.reduce((sum, game) => sum + getGameLayoutProfile(game.layoutProfile).length, 0);
  return Object.freeze({ categories: categories.length, persistentTextChannels: channels.filter((resource) => resource.type === 'text').length, persistentVoiceEntryChannels: channels.filter((resource) => resource.type === 'voice').length, totalPersistentChannels: channels.length, gameCount: gameRegistry.length, layouts: Object.freeze(layouts), persistentGameChannels: gameChannels, averagePersistentChannelsPerGame: gameRegistry.length ? gameChannels / gameRegistry.length : 0 });
}

function buildGovernancePermissionMatrix(desiredState = {}, gameRegistry = []) {
  const roles = ['everyone', 'guest', 'member', 'game', ...gameRegistry.map((game) => `game:${game.id}`), 'dev', 'invest', 'creator', 'night', 'mod', 'admin', 'owner'];
  return Object.freeze(Object.fromEntries(roles.map((roleKey) => [roleKey, Object.freeze(Object.fromEntries((desiredState.resources || []).map((resource) => [resource.key, canRoleKeysAccessResource([roleKey], resource)])))])));
}

function validateProjectedGuildQuality({ desiredState = {}, gameRegistry = [], plan = { actions: [] } } = {}) {
  const resources = desiredState.resources || [];
  const stats = buildProjectedGuildStats(desiredState, gameRegistry);
  const failures = [];
  const categories = new Set(resources.filter((resource) => resource.type === 'category').map((resource) => resource.key));
  const duplicate = new Set();
  for (const resource of resources.filter((resource) => resource.type !== 'category')) {
    const identity = `${resource.parentKey}:${resource.displayName}`;
    if (duplicate.has(identity)) failures.push(`DUPLICATE_CHANNEL_IDENTITY:${identity}`);
    duplicate.add(identity);
    if (!categories.has(resource.parentKey)) failures.push(`ORPHAN_CHANNEL:${resource.key}`);
  }
  for (const category of categories) if (!resources.some((resource) => resource.parentKey === category)) failures.push(`EMPTY_CANONICAL_CATEGORY:${category}`);
  if (stats.averagePersistentChannelsPerGame > 3) failures.push('GAME_CHANNEL_PROLIFERATION');
  if (resources.some((resource) => /archive/i.test(resource.displayName))) failures.push('ARCHIVE_RESOURCE');
  if (resources.some((resource) => resource.purpose === ChannelPurpose.RUNTIME_VOICE && resource.lifecycle === 'persistent')) failures.push('RUNTIME_VOICE_PERSISTENT');
  if ((plan.actions || []).some((action) => /ARCHIVE/.test(action.action))) failures.push('ARCHIVE_ACTION');
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures), stats });
}

module.exports = { buildGovernancePermissionMatrix, buildProjectedGuildStats, validateProjectedGuildQuality };
