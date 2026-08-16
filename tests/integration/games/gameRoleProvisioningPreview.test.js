const assert = require('node:assert/strict');
const { Collection, PermissionFlagsBits } = require('discord.js');
const { createGameRoleProvisioningFeature } = require('../../../src/composition/gameRoleProvisioningFeature');

void (async () => {
  const roles = new Collection([
    ['v', { id: 'v', name: '🎯 VALORANT' }],
    ['a', { id: 'a', name: 'APEX' }]
  ]);
  const guild = {
    members: { me: { permissions: { has: (value) => value === PermissionFlagsBits.ManageRoles } } },
    roles: { cache: roles, create: async () => { throw new Error('preview must not create'); } }
  };
  const feature = createGameRoleProvisioningFeature({ resolveGuild: async () => guild });
  const preview = await feature.gameRoleProvisioning.previewGameRoleProvisioning({ guildId: 'g1' });
  assert.equal(preview.ok, false);
  assert.equal(preview.existing.some((item) => item.gameId === 'valorant'), true);
  assert.equal(preview.wouldCreate.some((item) => item.gameId === 'league_of_legends'), true);
  assert.equal(preview.conflicts.some((item) => item.gameId === 'apex' && item.code === 'LEGACY_LIKE_ROLE_NAME'), true);
  console.log('Game role provisioning preview integration tests passed.');
})();
