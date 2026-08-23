const { CATEGORIES } = require('./communityArchitectureV3');
const GAME_REGISTRY = require('../games/gameRegistry');
const { getGameRoleKey } = require('../games/gameAccessPolicy');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose, PermissionProfile, createGovernedResource } = require('./channelGovernance');

const CATEGORY_IDENTITY = Object.freeze({ entry: 'entry', lobby: 'community', game_center: 'game_center', interests: 'interests', events: 'events', admin: 'admin' });
function categoryPurpose(key) { return key === 'entry' ? ChannelPurpose.ENTRY : key === 'game_center' ? ChannelPurpose.GAME_CENTER : key === 'admin' ? ChannelPurpose.ADMIN : key === 'events' ? ChannelPurpose.EVENT : ChannelPurpose.COMMUNITY_CHAT; }
function categoryProfile(key) { return key === 'entry' ? PermissionProfile.PUBLIC_ENTRY : key === 'game_center' ? PermissionProfile.GAME_CENTER : key === 'admin' ? PermissionProfile.ADMIN : PermissionProfile.MEMBER_DISCUSSION; }

function buildServerGovernanceDesiredState({ categories = CATEGORIES, gameRegistry = GAME_REGISTRY } = {}) {
  const staticCategories = categories.filter((category) => CATEGORY_IDENTITY[category.key]).map((category) => createGovernedResource({
    key: `category:${CATEGORY_IDENTITY[category.key]}`, displayName: category.name, type: 'category', purpose: categoryPurpose(category.key), owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile: categoryProfile(category.key), lifecycle: ChannelLifecycle.PERSISTENT, importance: 'high', deletePolicy: 'managed_only', legacyNames: category.aliases || []
  }));
  const games = gameRegistry.map((game) => createGovernedResource({
    key: `category:game:${game.id}`, displayName: `🎮｜${game.displayName}`, type: 'category', purpose: ChannelPurpose.GAME_CENTER, owner: ChannelOwnership.MANAGED_CANONICAL, parentKey: 'category:game_center', accessProfile: PermissionProfile.SPECIFIC_GAME, accessRoleKey: getGameRoleKey(game.id), lifecycle: ChannelLifecycle.PERSISTENT, importance: 'normal', deletePolicy: 'managed_only', legacyNames: [game.displayName]
  }));
  return Object.freeze({ resources: Object.freeze([...staticCategories, ...games]) });
}
module.exports = { buildServerGovernanceDesiredState };
