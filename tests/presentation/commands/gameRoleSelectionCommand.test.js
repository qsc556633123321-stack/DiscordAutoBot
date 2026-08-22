const assert = require('node:assert/strict');
const { createGameRoleSelectionCommand } = require('../../../src/presentation/commands/gameRoleSelectionCommand');
void (async () => {
  const calls = [];
  const command = createGameRoleSelectionCommand({ createFeature: () => ({ gameRoleSelection: { getSelectionState: async () => ({ hasParentGameRole: true, selectedGameIds: ['valorant'] }) } }), renderSelector: (state) => ({ content: state.selectedGameIds.join(',') }) });
  await command.execute({ guild: { id: 'g1' }, user: { id: 'u1' }, deferReply: async (payload) => calls.push(['defer', payload]), editReply: async (payload) => calls.push(['edit', payload]) });
  assert.equal(calls.length, 2);
  assert.equal(calls[1][1].content, 'valorant');
  const denied = [];
  await createGameRoleSelectionCommand({ createFeature: () => ({ gameRoleSelection: { getSelectionState: async () => ({ hasParentGameRole: false }) } }) }).execute({ guild: { id: 'g1' }, user: { id: 'u1' }, deferReply: async () => {}, editReply: async (payload) => denied.push(payload) });
  assert.match(denied[0], /遊戲玩家/);
  console.log('Game role selection command tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
