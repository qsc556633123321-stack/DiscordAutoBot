const assert = require('node:assert/strict');
const { createCommunityAboutCommand } = require('../../../src/presentation/commands/communityAboutCommand');

const expectedEmbed = {
  color: 5763719,
  title: '🌙 KU Community 是什麼？',
  description: '這是一個偏向深夜遊戲、語音陪伴、AI 工具與社群實驗的 Discord Community OS。\n\n我們重視的是有人感：有人開房、有人聊天、有人一起玩，慢慢變成熟面孔。',
  fields: [
    { name: '你可以從哪裡開始', value: '`/help-me-start`、領身分組、看看目前語音房、或直接按導覽面板。', inline: false },
    { name: '目前伺服器', value: 'Test Guild', inline: true },
    { name: '核心方向', value: '遊戲、語音、深夜聊天室、AI 社群工具', inline: true }
  ],
};
const calls = [];
const interaction = {
  guild: { name: 'Test Guild' },
  reply: async (payload) => calls.push(payload)
};
const command = createCommunityAboutCommand({ useCase: { execute: () => ({ ok: true, data: { about: { embed: expectedEmbed } } }) } });

(async () => {
  await command.execute(interaction);
  assert.deepEqual(JSON.parse(JSON.stringify(command.data.toJSON())), { options: [], name: 'community-about', description: '了解這個社群是做什麼的', type: 1 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ephemeral, true);
  const renderedEmbed = calls[0].embeds[0].toJSON();
  assert.match(renderedEmbed.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  delete renderedEmbed.timestamp;
  assert.deepEqual(renderedEmbed, expectedEmbed);
  const failed = createCommunityAboutCommand({ useCase: { execute: () => ({ ok: false, error: { message: 'source failed' } }) } });
  await assert.rejects(() => failed.execute(interaction), /source failed/);
  console.log('Community About presentation tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
