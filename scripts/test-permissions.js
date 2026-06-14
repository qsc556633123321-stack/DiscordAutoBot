const assert = require('node:assert/strict');
const architecture = require('../src/domain/community/communityArchitectureV3');
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

assert.deepEqual(visibleCategories(['guest']).sort(), ['entry', 'support']);
assert.deepEqual(visibleCategories(['everyone']).sort(), ['entry', 'support']);

assertIncludes(
  visibleCategories(['member']),
  ['lobby', 'game_center', 'interests', 'events'],
  'formal member visibility'
);

assert.deepEqual(ROLE_INHERITANCE.game, ['member']);
assert.ok(expandRoleKeys(['game']).includes('member'), 'game role must inherit member');
assertIncludes(
  visibleCategories(['game']),
  ['lobby', 'game_center', 'popular_games', 'player_games'],
  'game player visibility'
);
assert.ok(directRoleKeysForCategory('game_center').includes('game'), 'game role overwrite must directly allow game center');
assert.deepEqual(directRoleKeysForCategory('popular_games'), ['game']);
assert.ok(directRoleKeysForProfile('formal_member').includes('game'), 'formal member overwrite must allow game role inheritance');

assert.ok(roleCanAccessCategory(['night'], 'night_crew'), 'Night Crew must see Night Crew category');
assert.ok(roleCanAccessCategory(['admin'], 'admin'), 'admin must see admin category');
assert.equal(roleCanAccessCategory(['guest'], 'game_center'), false, 'guest must not see game center');
assert.equal(roleCanAccessCategory(['everyone'], 'popular_games'), false, '@everyone must not see popular games');

const popular = architecture.categories.find((category) => category.key === 'popular_games');
const player = architecture.categories.find((category) => category.key === 'player_games');
assert.equal(popular.permission, 'game');
assert.equal(player.permission, 'game');

console.log('Permission Matrix tests passed.');
