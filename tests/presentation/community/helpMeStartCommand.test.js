const assert = require('node:assert/strict');
const { createHelpMeStartCommand } = require('../../../src/presentation/commands/helpMeStartCommand');

async function main() {
  const calls = [];
  const command = createHelpMeStartCommand({
    clock: () => new Date('2025-01-02T03:04:05.678Z'),
    featureFactory: () => ({ getHelpMeStartRecommendation: { execute: async (input) => {
      calls.push(['execute', input]);
      return { description: '測試說明', recommendation: { channels: ['<#1>'], roles: ['🎮 遊戲玩家'], tips: ['測試提示'] } };
    } } })
  });
  const interaction = {
    guild: { id: 'guild-1', name: 'Test Guild' },
    options: { getString: (name) => ({ game: null, style: null, online_time: null }[name]) },
    deferReply: async (payload) => calls.push(['defer', payload]),
    editReply: async (payload) => calls.push(['edit', payload])
  };
  await command.execute(interaction);
  assert.deepEqual(calls[0], ['defer', { ephemeral: true }]);
  assert.deepEqual(calls[1], ['execute', { guildId: 'guild-1', guildName: 'Test Guild', answers: { game: '', style: 'chat', onlineTime: 'mixed' } }]);
  const payload = calls[2][1];
  const embed = payload.embeds[0].toJSON();
  assert.deepEqual(JSON.parse(JSON.stringify(command.data.toJSON())), {
    options: [
      { type: 3, name: 'game', description: '你通常玩什麼？例如 TFT、LOL、APEX、Minecraft', required: false, max_length: 80 },
      { type: 3, name: 'style', description: '你比較喜歡哪種社群玩法？', required: false, choices: [{ name: '上分', value: 'rank' }, { name: '閒聊', value: 'chat' }, { name: '深夜掛語音', value: 'night' }, { name: '技術討論', value: 'tech' }] },
      { type: 3, name: 'online_time', description: '你通常幾點上線？', required: false, choices: [{ name: '白天', value: 'day' }, { name: '晚上', value: 'evening' }, { name: '深夜', value: 'late' }, { name: '不固定', value: 'mixed' }] }
    ], name: 'help-me-start', description: '用幾個問題快速推薦你該去哪裡開始', type: 1
  });
  assert.equal(embed.color, 0x5865f2);
  assert.equal(embed.title, '🧭 你的快速開始路線');
  assert.equal(embed.description, '測試說明');
  assert.deepEqual(embed.fields, [
    { name: '推薦頻道', value: '<#1>', inline: false },
    { name: '建議身分組', value: '🎮 遊戲玩家', inline: false },
    { name: '開始方式', value: '測試提示', inline: false }
  ]);
  assert.equal(embed.footer.text, '這只是起點，你可以慢慢調整自己的社群路線。');
  assert.equal(embed.timestamp, '2025-01-02T03:04:05.678Z');

  const fallbackCommand = createHelpMeStartCommand({
    featureFactory: () => ({ getHelpMeStartRecommendation: { execute: async () => ({ description: 'fallback', recommendation: { channels: [], roles: [], tips: [] } }) } })
  });
  const fallbackCalls = [];
  await fallbackCommand.execute({
    guild: { id: 'guild-1', name: 'Test Guild' },
    options: { getString: () => null },
    deferReply: async () => null,
    editReply: async (value) => fallbackCalls.push(value)
  });
  assert.deepEqual(fallbackCalls[0].embeds[0].toJSON().fields, [
    { name: '推薦頻道', value: '先從伺服器導覽開始。', inline: false },
    { name: '建議身分組', value: '先領取你感興趣的身分組。', inline: false },
    { name: '開始方式', value: '看看目前語音房，或用 `/suggest-game` 提議想玩的遊戲。', inline: false }
  ]);
  console.log('Help-me-start presentation tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
