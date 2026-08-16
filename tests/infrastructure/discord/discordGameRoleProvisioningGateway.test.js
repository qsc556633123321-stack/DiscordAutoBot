const assert = require('node:assert/strict');
const { Collection, PermissionFlagsBits } = require('discord.js');
const { createDiscordGameRoleProvisioningGateway } = require('../../../src/infrastructure/discord/discordGameRoleProvisioningGateway');

function role(id, name) {
  const calls = { delete: [] };
  return { id, name, calls, async delete(reason) { calls.delete.push(reason); } };
}

void (async () => {
  const valorant = role('v1', '🎯 VALORANT');
  const legacy = role('v0', 'VALORANT');
  const calls = { create: [] };
  const guild = {
    members: { me: { permissions: { has: (value) => value === PermissionFlagsBits.ManageRoles } } },
    roles: {
      cache: new Collection([[valorant.id, valorant], [legacy.id, legacy]]),
      async create(spec) { calls.create.push(spec); return role('new-1', spec.name); }
    }
  };
  const gateway = createDiscordGameRoleProvisioningGateway({ resolveGuild: async () => guild });
  assert.equal((await gateway.preflightManageRoles({ guildId: 'g1' })).canManageRoles, true);
  assert.deepEqual(await gateway.findRolesByExactName({ guildId: 'g1', name: '🎯 VALORANT' }), [{ roleId: 'v1', roleName: '🎯 VALORANT' }]);
  assert.deepEqual(await gateway.findRolesByExactName({ guildId: 'g1', name: 'VALORANT' }), [{ roleId: 'v0', roleName: 'VALORANT' }]);
  assert.deepEqual(await gateway.findRolesByExactName({ guildId: 'g1', name: 'valorant' }), []);
  const created = await gateway.createRole({ guildId: 'g1', roleName: '🔫 APEX' });
  assert.deepEqual(created, { roleId: 'new-1', roleName: '🔫 APEX' });
  assert.deepEqual(calls.create[0], { name: '🔫 APEX', permissions: [], mentionable: false, hoist: false, reason: 'Game role provisioning' });
  await gateway.deleteRole({ guildId: 'g1', roleId: 'v1' });
  assert.deepEqual(valorant.calls.delete, ['Game role provisioning rollback']);
  await assert.rejects(() => gateway.deleteRole({ guildId: 'g1', roleId: 'missing' }), (error) => error.code === 'ROLE_NOT_FOUND');
  console.log('Discord game role provisioning gateway tests passed.');
})();
