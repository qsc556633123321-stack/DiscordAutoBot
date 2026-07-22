const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const legacy = require('../../src/legacy/commands/forget-channel-rule');
const presentation = require('../../src/presentation/commands/forgetChannelRuleCommand');

function createInteraction({ guild = { id: 'guild-1' }, canManage = true, keyword = 'APEX' } = {}) {
  const calls = [];
  return {
    calls,
    guild,
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.ManageChannels && canManage },
    options: { getString: () => keyword },
    reply: async (payload) => calls.push(payload)
  };
}

async function legacyBaseline(interaction, remove) {
  if (!interaction.guild) return interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({ content: '你需要 ManageChannels 權限才能刪除記憶規則。', ephemeral: true });
  }
  const keyword = interaction.options.getString('keyword');
  try {
    const deleted = remove(interaction.guild.id, keyword);
    return interaction.reply({
      content: deleted ? `已刪除關鍵字 \`${keyword}\` 的記憶規則。` : `找不到關鍵字 \`${keyword}\` 的記憶規則。`,
      ephemeral: true
    });
  } catch (error) {
    return interaction.reply({ content: `刪除記憶規則失敗：${error.message}`, ephemeral: true });
  }
}

async function assertParity(input, remove) {
  const oldInteraction = createInteraction(input);
  const newInteraction = createInteraction(input);
  await legacyBaseline(oldInteraction, remove);
  const command = presentation.createForgetChannelRuleCommand({
    useCase: { execute: (params) => ({ ok: true, data: { deleted: remove(params.guildId, params.keyword) } }) },
    logger: { error: () => {} }
  });
  await command.execute(newInteraction);
  assert.deepEqual(newInteraction.calls, oldInteraction.calls);
}

async function main() {
  await assertParity({ keyword: 'APEX' }, () => true);
  await assertParity({ keyword: 'Unknown' }, () => false);

  const noGuild = createInteraction({ guild: null });
  await presentation.createForgetChannelRuleCommand({ useCase: { execute: () => assert.fail('must not execute') } }).execute(noGuild);
  assert.deepEqual(noGuild.calls, [{ content: '這個指令只能在伺服器中使用。', ephemeral: true }]);

  const denied = createInteraction({ canManage: false });
  await presentation.createForgetChannelRuleCommand({ useCase: { execute: () => assert.fail('must not execute') } }).execute(denied);
  assert.deepEqual(denied.calls, [{ content: '你需要 ManageChannels 權限才能刪除記憶規則。', ephemeral: true }]);

  const failure = createInteraction();
  await presentation.createForgetChannelRuleCommand({
    useCase: { execute: () => { throw new Error('storage unavailable'); } }, logger: { error: () => {} }
  }).execute(failure);
  assert.deepEqual(failure.calls, [{ content: '刪除記憶規則失敗：storage unavailable', ephemeral: true }]);

  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
  console.log('forget-channel-rule migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
