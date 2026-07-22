const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const legacy = require('../../src/legacy/commands/learn-channel');
const presentation = require('../../src/presentation/commands/learnChannelCommand');

function createInteraction({ guild = { id: 'guild-1' }, canManage = true, keyword = 'APEX', category = { name: 'Games' }, weight = null } = {}) {
  const calls = [];
  return {
    calls,
    guild,
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.ManageChannels && canManage },
    options: {
      getString: () => keyword,
      getChannel: () => category,
      getInteger: () => weight
    },
    reply: async (payload) => calls.push(payload)
  };
}

async function legacyBaseline(interaction, upsert) {
  if (!interaction.guild) return interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({ content: '你需要 ManageChannels 權限才能讓 Bot 學習分類規則。', ephemeral: true });
  }
  const keyword = interaction.options.getString('keyword');
  const category = interaction.options.getChannel('category');
  const weight = interaction.options.getInteger('weight') || 5;
  try {
    const rule = upsert(interaction.guild.id, { keyword, category: category.name, weight });
    return interaction.reply({ content: `學習成功：之後頻道名稱命中 \`${rule.keyword}\` 時，會對 \`${rule.category}\` 加上 ${rule.weight} 分。`, ephemeral: true });
  } catch (error) {
    return interaction.reply({ content: `學習失敗：${error.message}`, ephemeral: true });
  }
}

async function assertParity(input, execute) {
  const oldInteraction = createInteraction(input);
  const newInteraction = createInteraction(input);
  await legacyBaseline(oldInteraction, execute);
  const command = presentation.createLearnChannelCommand({
    useCase: { execute: (params) => ({ ok: true, data: execute(params.guildId, params) }) },
    logger: { error: () => {} }
  });
  await command.execute(newInteraction);
  assert.deepEqual(newInteraction.calls, oldInteraction.calls);
}

async function main() {
  await assertParity({}, (_guildId, input) => ({ keyword: input.keyword, category: input.category, weight: input.weight }));
  await assertParity({ keyword: 'LOL', category: { name: 'Ranked' }, weight: 8 }, (_guildId, input) => ({ keyword: input.keyword, category: input.category, weight: input.weight }));

  const noGuild = createInteraction({ guild: null });
  await presentation.createLearnChannelCommand({ useCase: { execute: () => assert.fail('must not execute') } }).execute(noGuild);
  assert.deepEqual(noGuild.calls, [{ content: '這個指令只能在伺服器中使用。', ephemeral: true }]);

  const denied = createInteraction({ canManage: false });
  await presentation.createLearnChannelCommand({ useCase: { execute: () => assert.fail('must not execute') } }).execute(denied);
  assert.deepEqual(denied.calls, [{ content: '你需要 ManageChannels 權限才能讓 Bot 學習分類規則。', ephemeral: true }]);

  const failure = createInteraction();
  await presentation.createLearnChannelCommand({
    useCase: { execute: () => { throw new Error('storage unavailable'); } }, logger: { error: () => {} }
  }).execute(failure);
  assert.deepEqual(failure.calls, [{ content: '學習失敗：storage unavailable', ephemeral: true }]);

  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
  console.log('learn-channel migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
