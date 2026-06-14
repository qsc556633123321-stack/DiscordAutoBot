const assert = require('node:assert/strict');
const { ChannelType, Collection } = require('discord.js');
const architecture = require('../src/domain/community/communityArchitectureV3');
const permissionService = require('../src/services/community/communityPermissionService');
const { createCategoryCleanupPlan } = require('../src/systems/categoryCleaner');
const {
  CATEGORY_ACCESS,
  ROLE_INHERITANCE,
  directRoleKeysForCategory,
  directRoleKeysForProfile,
  expandRoleKeys,
  roleCanAccessCategory
} = require('../src/domain/community/permissionMatrix');

function visibleCategories(roleKeys) {
  return Object.keys(CATEGORY_ACCESS).filter((categoryKey) => roleCanAccessCategory(roleKeys, categoryKey));
}

function assertIncludes(actual, expected, label) {
  for (const item of expected) assert.ok(actual.includes(item), `${label} must include ${item}`);
}

assert.deepEqual(visibleCategories(['guest']).sort(), ['entry']);
assert.deepEqual(visibleCategories(['everyone']).sort(), ['entry']);

assertIncludes(
  visibleCategories(['member']),
  ['lobby', 'game_center', 'interests', 'events'],
  'formal member visibility'
);

for (const roleKey of ['game', 'dev', 'invest', 'creator', 'night']) {
  assert.deepEqual(ROLE_INHERITANCE[roleKey], ['member'], `${roleKey} must inherit formal member`);
  assert.ok(expandRoleKeys([roleKey]).includes('member'), `${roleKey} must expand to formal member`);
}
assertIncludes(
  visibleCategories(['game']),
  ['lobby', 'game_center', 'popular_games', 'player_games'],
  'game player visibility'
);
assert.ok(directRoleKeysForCategory('game_center').includes('game'), 'game role overwrite must directly allow game center');
assert.deepEqual(directRoleKeysForCategory('popular_games'), ['game']);
assert.ok(directRoleKeysForProfile('formal_member').includes('game'), 'formal member overwrite must allow game role inheritance');

assert.ok(roleCanAccessCategory(['night'], 'lobby'), 'Night Crew must inherit formal member visibility');
assert.ok(roleCanAccessCategory(['admin'], 'admin'), 'admin must see admin category');
assert.equal(roleCanAccessCategory(['guest'], 'game_center'), false, 'guest must not see game center');
assert.equal(roleCanAccessCategory(['everyone'], 'popular_games'), false, '@everyone must not see popular games');

const popular = architecture.categories.find((category) => category.key === 'popular_games');
const player = architecture.categories.find((category) => category.key === 'player_games');
assert.equal(popular.permission, 'game');
assert.equal(player.permission, 'game');

const architectureCategoryKeys = new Set(architecture.categories.map((category) => category.key));
const architectureRoleKeys = new Set(architecture.roles.map((role) => role.key));
for (const [categoryKey, roleKeys] of Object.entries(CATEGORY_ACCESS)) {
  assert.ok(architectureCategoryKeys.has(categoryKey) || categoryKey === 'dynamic_game', `unknown category key: ${categoryKey}`);
  for (const roleKey of roleKeys) {
    assert.ok(['everyone'].includes(roleKey) || architectureRoleKeys.has(roleKey), `unknown role key: ${roleKey}`);
  }
}

const lobby = architecture.categories.find((category) => category.key === 'lobby');
assert.deepEqual(
  lobby.channels.map((channel) => channel.key),
  ['general', 'late_night', 'life_share', 'meme_share', 'night_lounge'],
  'community lobby must remain simplified'
);
const interests = architecture.categories.find((category) => category.key === 'interests');
assert.ok(interests.channels.some((channel) => channel.key === 'casual_voice'), 'casual voice must move to interests');
assert.ok(interests.channels.some((channel) => channel.key === 'ai_tools'), 'AI tools must converge into interests');
assert.ok(interests.channels.some((channel) => channel.key === 'stocks'), 'investment channels must converge into interests');
const gameCenter = architecture.categories.find((category) => category.key === 'game_center');
assert.deepEqual(
  gameCenter.channels.map((channel) => channel.key),
  ['lfg', 'voice_hub', 'game_suggestions', 'game_database', 'game_ranking']
);

const mockGuild = { id: 'guild', channels: { cache: new Collection() } };
const gameCenterCategory = {
  id: 'category',
  name: gameCenter.name,
  type: ChannelType.GuildCategory,
  guild: mockGuild
};
mockGuild.channels.cache.set(gameCenterCategory.id, gameCenterCategory);
for (const spec of gameCenter.channels) {
  mockGuild.channels.cache.set(spec.key, {
    id: spec.key,
    name: spec.name,
    type: spec.type,
    guild: mockGuild,
    parent: gameCenterCategory,
    parentId: gameCenterCategory.id
  });
}
const permissionPlan = permissionService.buildRepairPlan(mockGuild, { scope: 'all', mode: 'preview' });
assert.equal(permissionPlan.ok, true);
assert.equal(permissionPlan.data.actions.some((action) => action.visibilityType === undefined), false);
assert.equal(permissionPlan.data.actions.some((action) => action.targetName === undefined), false);

const cleanupGuild = {
  id: 'cleanup-guild',
  systemChannelId: null,
  rulesChannelId: null,
  publicUpdatesChannelId: null,
  channels: { cache: new Collection() }
};
const duplicateA = { id: 'duplicate-a', name: 'Unused Category', type: ChannelType.GuildCategory, guild: cleanupGuild };
const duplicateB = { id: 'duplicate-b', name: 'Unused Category', type: ChannelType.GuildCategory, guild: cleanupGuild };
const orphan = { id: 'orphan', name: 'unused-channel', type: ChannelType.GuildText, parentId: null, guild: cleanupGuild };
cleanupGuild.channels.cache.set(duplicateA.id, duplicateA);
cleanupGuild.channels.cache.set(duplicateB.id, duplicateB);
cleanupGuild.channels.cache.set(orphan.id, orphan);
const cleanupPlan = createCategoryCleanupPlan(cleanupGuild);
assert.equal(cleanupPlan.items.filter((item) => item.duplicate && item.candidate).length, 1);
assert.deepEqual(cleanupPlan.orphanChannels.map((item) => item.channelId), ['orphan']);

console.log('Permission Matrix tests passed.');
