const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { createGameRoleProvisioningPreviewCommand } = require('../../../src/presentation/commands/gameRoleProvisioningPreviewCommand');

function interaction({ administrator = true, guild = { id: 'guild-1' } } = {}) {
  const calls = [];
  return {
    guild,
    memberPermissions: { has: (permission) => administrator && permission === PermissionFlagsBits.Administrator },
    deferReply: async (payload) => calls.push(['defer', payload]),
    editReply: async (payload) => calls.push(['edit', payload]),
    calls
  };
}

void (async () => {
  let previewCalls = 0;
  let resolveGuildCalls = 0;
  const command = createGameRoleProvisioningPreviewCommand({
    createFeature: ({ resolveGuild }) => {
      resolveGuildCalls += 1;
      return { gameRoleProvisioning: { previewGameRoleProvisioning: async ({ guildId }) => {
        previewCalls += 1;
        assert.equal(guildId, 'guild-1');
        assert.equal(await resolveGuild(guildId), guild);
        return { existing: [], wouldCreate: [{ roleName: '🎯 VALORANT' }], conflicts: [] };
      } } };
    },
    renderPreview: (preview) => ({ content: 'preview:' + preview.wouldCreate.length })
  });
  const guild = { id: 'guild-1' };
  const admin = interaction({ guild });
  await command.execute(admin);
  assert.deepEqual(admin.calls, [['defer', { ephemeral: true }], ['edit', { content: 'preview:1' }]]);
  assert.equal(previewCalls, 1);
  assert.equal(resolveGuildCalls, 1);

  const denied = interaction({ administrator: false });
  await command.execute(denied);
  assert.equal(previewCalls, 1);
  assert.equal(denied.calls[1][1], '你需要 Administrator 權限才能預覽遊戲身分組。');

  const noGuild = interaction({ guild: null });
  await command.execute(noGuild);
  assert.equal(previewCalls, 1);
  assert.equal(noGuild.calls[1][1], '這個指令只能在伺服器內使用。');
  console.log('Game role preview command tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
