const assert = require('node:assert/strict');
const { Collection } = require('discord.js');
const { handle } = require('../../../src/modules/interactions/selectHandlers/gameRoleSelectionSelectMenu');
const GAME_REGISTRY = require('../../../src/domain/games/gameRegistry');
const { getGameRoleName } = require('../../../src/domain/games/gameAccessPolicy');
void (async () => {
  const calls = [];
  const guildRoles = new Collection(GAME_REGISTRY.map((game) => [game.id, { id: game.id, name: getGameRoleName(game), editable: true }]));
  const memberRoles = new Collection([['parent', { id: 'parent', name: '🎮 遊戲玩家' }]]);
  const member = { roles: { cache: memberRoles, add: async (roleId) => calls.push(['add', roleId]), remove: async (roleId) => calls.push(['remove', roleId]) } };
  const interaction = {
    customId: 'game_role_selection_menu', guild: { id: 'g1', roles: { cache: guildRoles } }, member, user: { id: 'u1' }, values: ['valorant'], deferred: false, replied: false,
    deferReply: async (payload) => { calls.push(['defer', payload]); interaction.deferred = true; },
    editReply: async (payload) => calls.push(['edit', payload])
  };
  await handle(interaction);
  assert.equal(calls[0][0], 'defer');
  assert.equal(calls.filter((call) => call[0] === 'defer').length, 1);
  assert.deepEqual(calls.filter((call) => call[0] === 'add').map((call) => call[1]), ['valorant']);
  assert.equal(calls.filter((call) => call[0] === 'remove').length, 0);
  console.log('Game role selection interaction integration tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
