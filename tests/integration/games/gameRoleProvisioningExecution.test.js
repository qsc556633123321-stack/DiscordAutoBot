const assert = require('node:assert/strict');
const { createGameRoleProvisioningUseCase } = require('../../../src/application/games/gameRoleProvisioningUseCase');

void (async () => {
  const calls = { create: [], delete: [] };
  const gateway = {
    async preflightManageRoles() { return { canManageRoles: true }; },
    async findRolesByExactName({ name }) { return name === '🎯 VALORANT' ? [{ roleId: 'existing-v', roleName: name }] : []; },
    async createRole({ roleName }) {
      calls.create.push(roleName);
      if (roleName === '⛏️ Minecraft') throw Object.assign(new Error('fail'), { code: 'CREATE_REJECTED' });
      return { roleId: 'new-' + calls.create.length, roleName };
    },
    async deleteRole({ roleId }) { calls.delete.push(roleId); }
  };
  const games = [
    { id: 'valorant', displayName: 'VALORANT', emoji: '🎯' },
    { id: 'apex', displayName: 'APEX', emoji: '🔫' },
    { id: 'minecraft', displayName: 'Minecraft', emoji: '⛏️' }
  ];
  const result = await createGameRoleProvisioningUseCase({ gateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(result.ok, false);
  assert.equal(result.existing[0].roleId, 'existing-v');
  assert.deepEqual(calls.create, ['🔫 APEX', '⛏️ Minecraft']);
  assert.deepEqual(calls.delete, ['new-1']);
  console.log('Game role provisioning execution integration tests passed.');
})();
