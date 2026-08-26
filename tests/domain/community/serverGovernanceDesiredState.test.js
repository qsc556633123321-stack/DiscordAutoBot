const assert = require('node:assert/strict');
const GAME_REGISTRY = require('../../../src/domain/games/gameRegistry');
const { canRoleKeysAccessResource } = require('../../../src/domain/community/serverGovernanceAccessPolicy');
const { buildFullGuildDesiredState } = require('../../../src/domain/community/serverGovernanceDesiredState');

const desired = buildFullGuildDesiredState();
const byKey = new Map(desired.resources.map((resource) => [resource.key, resource]));
for (const key of ['category:entry', 'category:community', 'category:game_center', 'category:interests', 'category:events', 'category:support', 'category:admin']) assert.equal(byKey.has(key), true);
for (const game of GAME_REGISTRY) {
  const category = byKey.get(`category:game:${game.id}`);
  assert.equal(category.accessRoleKey, `game:${game.id}`);
  assert.equal(canRoleKeysAccessResource(['game'], category), false);
  assert.equal(canRoleKeysAccessResource([`game:${game.id}`], category), true);
  assert.equal(desired.resources.filter((resource) => resource.parentKey === category.key).length, game.layoutProfile === 'full' ? 4 : 0);
}
assert.equal(byKey.get('channel:dev').accessRoleKey, 'dev');
assert.equal(byKey.get('channel:admin_logs').accessProfile, 'bot_internal');
assert.equal(desired.resources.some((resource) => ['runtime', 'temporary'].includes(resource.lifecycle)), false);
const compact = buildFullGuildDesiredState({ gameRegistry: [{ id: 'compact_game', displayName: 'Compact', emoji: '🎮', layoutProfile: 'compact' }] });
assert.equal(compact.resources.filter((resource) => resource.parentKey === 'category:game:compact_game').length, 2);
const voiceOnly = buildFullGuildDesiredState({ gameRegistry: [{ id: 'voice_game', displayName: 'Voice', emoji: '🎮', layoutProfile: 'voice_only' }] });
assert.equal(voiceOnly.resources.filter((resource) => resource.parentKey === 'category:game:voice_game').length, 1);
console.log('Full server governance desired-state tests passed.');
