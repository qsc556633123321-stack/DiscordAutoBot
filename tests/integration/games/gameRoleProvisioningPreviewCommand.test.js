const assert = require('node:assert/strict');
const { Collection, PermissionFlagsBits } = require('discord.js');
const { createGameRoleProvisioningPreviewCommand } = require('../../../src/presentation/commands/gameRoleProvisioningPreviewCommand');

function createGuild(roles) {
  const calls = { create: 0, delete: 0, add: 0, remove: 0 };
  return {
    id: 'guild-1',
    calls,
    members: {
      me: { permissions: { has: (permission) => permission === PermissionFlagsBits.ManageRoles } },
      cache: new Collection()
    },
    roles: {
      cache: new Collection(roles.map((role, index) => ['role-' + index, role])),
      create: async () => { calls.create += 1; throw new Error('preview must not create'); }
    }
  };
}

async function runPreview(guild) {
  const replies = [];
  const command = createGameRoleProvisioningPreviewCommand();
  await command.execute({
    guild,
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.Administrator },
    deferReply: async () => {},
    editReply: async (payload) => replies.push(payload)
  });
  return replies[0].embeds[0].toJSON();
}

void (async () => {
  const allMissing = createGuild([]);
  const allMissingEmbed = await runPreview(allMissing);
  assert.match(allMissingEmbed.description, /Would Create: 10/);
  assert.equal(allMissing.calls.create, 0);

  const allExisting = createGuild([
    { id: 'valorant', name: '🎯 VALORANT' }, { id: 'league', name: '⚔️ 英雄聯盟' },
    { id: 'tft', name: '♟️ 聯盟戰棋' }, { id: 'apex', name: '🔫 APEX' },
    { id: 'minecraft', name: '⛏️ Minecraft' }, { id: 'overwatch', name: '🛡️ 鬥陣特攻2' },
    { id: 'gtfo', name: '🧟 GTFO' }, { id: 'repo', name: '🤖 R.E.P.O' },
    { id: 'cs2', name: '🔫 CS2' }, { id: 'zomboid', name: '🧟 Project Zomboid' }
  ]);
  const allExistingEmbed = await runPreview(allExisting);
  assert.match(allExistingEmbed.description, /Existing: 10/);
  assert.equal(allExisting.calls.create, 0);

  const mixed = createGuild([{ id: 'valorant', name: '🎯 VALORANT' }, { id: 'legacy', name: 'APEX' }]);
  const mixedEmbed = await runPreview(mixed);
  assert.match(mixedEmbed.description, /Existing: 1/);
  assert.match(mixedEmbed.description, /Would Create: 8/);
  assert.match(mixedEmbed.description, /Conflicts: 1/);
  assert.equal(mixed.calls.create, 0);
  assert.equal(mixed.calls.delete, 0);
  assert.equal(mixed.calls.add, 0);
  assert.equal(mixed.calls.remove, 0);
  console.log('Game role preview command integration tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
