const assert = require('node:assert/strict');
const { Collection, PermissionFlagsBits } = require('discord.js');
const { createGameRoleProvisioningExecutionCommand, CONFIRMATION } = require('../../../src/presentation/commands/gameRoleProvisioningExecutionCommand');

function createGuild({ failCreateAt = null, failDelete = false } = {}) {
  const calls = { create: 0, delete: 0, memberAdd: 0, memberRemove: 0, permission: 0 };
  const cache = new Collection();
  const guild = {
    id: 'guild-1',
    members: { me: { permissions: { has: (permission) => permission === PermissionFlagsBits.ManageRoles } } },
    roles: { cache, create: async ({ name }) => {
      calls.create += 1;
      if (calls.create === failCreateAt) throw Object.assign(new Error('create failed'), { code: 'CREATE_REJECTED' });
      const role = { id: 'created-' + calls.create, name, delete: async () => { calls.delete += 1; if (failDelete) throw Object.assign(new Error('delete failed'), { code: 'DELETE_REJECTED' }); cache.delete(role.id); } };
      cache.set(role.id, role);
      return role;
    } }
  };
  return { guild, calls };
}

async function execute(guild) {
  const replies = [];
  await createGameRoleProvisioningExecutionCommand().execute({
    guild,
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.Administrator },
    options: { getString: () => CONFIRMATION },
    deferReply: async () => {},
    editReply: async (payload) => replies.push(payload)
  });
  return replies[0].embeds[0].toJSON();
}

void (async () => {
  const success = createGuild();
  const first = await execute(success.guild);
  assert.equal(success.calls.create, 10);
  assert.equal(success.calls.delete, 0);
  assert.equal(first.title, '✅ Game Role Provisioning Complete');
  const second = await execute(success.guild);
  assert.equal(success.calls.create, 10);
  assert.match(second.description, /所有遊戲身分組已存在/);
  assert.equal(success.calls.memberAdd, 0);
  assert.equal(success.calls.memberRemove, 0);
  assert.equal(success.calls.permission, 0);

  const rollback = createGuild({ failCreateAt: 3 });
  const rollbackEmbed = await execute(rollback.guild);
  assert.equal(rollback.calls.create, 3);
  assert.equal(rollback.calls.delete, 2);
  assert.equal(rollbackEmbed.title, 'Game Role Provisioning Failed');

  const rollbackFailure = createGuild({ failCreateAt: 3, failDelete: true });
  const rollbackFailureEmbed = await execute(rollbackFailure.guild);
  assert.equal(rollbackFailure.calls.create, 3);
  assert.equal(rollbackFailure.calls.delete, 2);
  assert.ok(rollbackFailureEmbed.fields.some((field) => field.name === 'Rollback Failed'));
  console.log('Game role execution command integration tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
