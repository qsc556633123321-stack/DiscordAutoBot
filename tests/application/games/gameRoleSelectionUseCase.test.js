const assert = require('node:assert/strict');
const { createGameRoleSelectionUseCase } = require('../../../src/application/games/gameRoleSelectionUseCase');
function fakeGateway({ parent = true, current = [], missing = [], failAdd = false, failRemove = false } = {}) {
  const calls = { resolve: 0, add: [], remove: [] };
  return { calls,
    getMemberRoleState: async () => ({ hasParentGameRole: parent, currentSpecificGameRoleKeys: current }),
    resolveSpecificGameRoles: async ({ gameIds }) => { calls.resolve += 1; return { rolesByGameId: Object.fromEntries(gameIds.map((id) => [id, { roleId: id }])), missingGameIds: missing, unmanageableGameIds: [] }; },
    addMemberRole: async ({ roleId }) => { calls.add.push(roleId); if (failAdd) throw new Error('add'); },
    removeMemberRole: async ({ roleId }) => { calls.remove.push(roleId); if (failRemove) throw new Error('remove'); }
  };
}
void (async () => {
  const deniedGateway = fakeGateway({ parent: false });
  assert.equal((await createGameRoleSelectionUseCase({ gateway: deniedGateway }).execute({ selectedGameIds: ['valorant'] })).code, 'PARENT_GAME_ROLE_REQUIRED');
  assert.equal(deniedGateway.calls.resolve, 0);
  const missingGateway = fakeGateway({ current: ['game:valorant'], missing: ['minecraft'] });
  const missing = await createGameRoleSelectionUseCase({ gateway: missingGateway }).execute({ selectedGameIds: ['minecraft'] });
  assert.equal(missing.code, 'ROLE_NOT_PROVISIONED');
  assert.deepEqual(missingGateway.calls.add, []);
  assert.deepEqual(missingGateway.calls.remove, []);
  const normalGateway = fakeGateway({ current: ['game:valorant', 'game:apex'] });
  const normal = await createGameRoleSelectionUseCase({ gateway: normalGateway }).execute({ selectedGameIds: ['valorant', 'minecraft'] });
  assert.equal(normal.ok, true);
  assert.deepEqual(normalGateway.calls.add, ['minecraft']);
  assert.deepEqual(normalGateway.calls.remove, ['apex']);
  assert.equal((await createGameRoleSelectionUseCase({ gateway: fakeGateway({ failAdd: true }) }).execute({ selectedGameIds: ['valorant'] })).code, 'ADD_FAILED');
  assert.equal((await createGameRoleSelectionUseCase({ gateway: fakeGateway({ current: ['game:valorant'], failRemove: true }) }).execute({ selectedGameIds: [] })).code, 'REMOVE_FAILED');
  assert.equal((await createGameRoleSelectionUseCase({ gateway: fakeGateway() }).execute({ selectedGameIds: ['bad'] })).code, 'UNKNOWN_GAME_ID');
  console.log('Game role selection use-case tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
