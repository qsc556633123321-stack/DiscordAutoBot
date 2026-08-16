const assert = require('node:assert/strict');
const GAME_REGISTRY = require('../../../src/domain/games/gameRegistry');
const {
  expandGameRoleKeys,
  getGameIdFromRoleKey,
  getGameRoleKey,
  getGameRoleName,
  isGameRoleKey,
  roleCanAccessGame,
  roleCanAccessGameCenter
} = require('../../../src/domain/games/gameAccessPolicy');
const { getGameId } = require('../../../src/domain/games/gameIdentityService');

assert.equal(GAME_REGISTRY.length, 10);
const roleKeys = GAME_REGISTRY.map((game) => getGameRoleKey(game.id));
const roleNames = GAME_REGISTRY.map((game) => getGameRoleName(game));
assert.equal(new Set(roleKeys).size, GAME_REGISTRY.length);
assert.equal(new Set(roleNames).size, GAME_REGISTRY.length);
assert.deepEqual(roleKeys, GAME_REGISTRY.map((game) => 'game:' + game.id));

assert.equal(getGameRoleKey('valorant'), 'game:valorant');
assert.equal(getGameRoleName('valorant'), '🎯 VALORANT');
assert.equal(getGameRoleName('league_of_legends'), '⚔️ 英雄聯盟');
assert.equal(getGameRoleName('teamfight_tactics'), '♟️ 聯盟戰棋');
assert.equal(getGameRoleKey('Valorant'), null);
assert.equal(getGameRoleKey(''), null);
assert.equal(getGameIdFromRoleKey('game:valorant'), 'valorant');
assert.equal(getGameIdFromRoleKey('game:Valorant'), null);
assert.equal(isGameRoleKey('game:valorant'), true);
assert.equal(isGameRoleKey('game'), false);

assert.deepEqual(expandGameRoleKeys(['member']), ['member']);
assert.deepEqual(expandGameRoleKeys(['game']), ['game', 'member']);
assert.deepEqual(expandGameRoleKeys(['game:valorant']), ['game:valorant', 'game', 'member']);
assert.equal(roleCanAccessGameCenter(['member']), false);
assert.equal(roleCanAccessGameCenter(['game']), true);
assert.equal(roleCanAccessGameCenter(['game:valorant']), true);
assert.equal(roleCanAccessGameCenter(['admin']), true);

assert.equal(roleCanAccessGame(['game:valorant'], 'valorant'), true);
assert.equal(roleCanAccessGame(['game:valorant'], 'apex'), false);
assert.equal(roleCanAccessGame(['game:valorant', 'game:apex'], 'valorant'), true);
assert.equal(roleCanAccessGame(['game:valorant', 'game:apex'], 'apex'), true);
assert.equal(roleCanAccessGame(['game:valorant'], 'unknown_game'), false);

const dynamicGameId = getGameId('A Brand New Game');
assert.equal(dynamicGameId, 'custom_a_brand_new_game');
assert.equal(getGameRoleKey(dynamicGameId), 'game:custom_a_brand_new_game');
assert.equal(roleCanAccessGame([getGameRoleKey(dynamicGameId)], dynamicGameId), true);
assert.equal(getGameRoleName({ id: dynamicGameId, displayName: 'A Brand New Game', emoji: '🎮' }), '🎮 A Brand New Game');

console.log('Game access policy domain tests passed.');
