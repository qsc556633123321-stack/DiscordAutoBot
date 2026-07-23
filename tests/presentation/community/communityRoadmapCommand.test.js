const assert = require('node:assert/strict');
const { createCommunityRoadmapCommand } = require('../../../src/presentation/commands/communityRoadmapCommand');

const roadmap = {
  sections: [
    { key: 'completed', label: '✅ 已完成', items: ['Done'] },
    { key: 'inProgress', label: '🛠 開發中', items: [] },
    { key: 'future', label: '🌌 未來計畫', items: ['Later'] }
  ]
};
const calls = [];
const command = createCommunityRoadmapCommand({
  useCase: { execute: () => ({ ok: true, data: { roadmap } }) }
});

(async () => {
  await command.execute({ reply: async (payload) => calls.push(payload) });
  assert.deepEqual(JSON.parse(JSON.stringify(command.data.toJSON())), {
    options: [], name: 'community-roadmap', description: '查看社群未來規劃與開發方向', type: 1
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ephemeral, true);
  const embed = calls[0].embeds[0].toJSON();
  assert.equal(embed.title, '🚧 社群開發日誌');
  assert.equal(embed.fields[0].value, '- Done');
  assert.equal(embed.fields[1].value, '整理中');
  assert.equal(embed.fields[2].value, '- Later');
  assert.equal(embed.footer.text, '如果你有想法，可以直接丟到建議區或開 Ticket。');
  assert.match(embed.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  const failed = createCommunityRoadmapCommand({ useCase: { execute: () => ({ ok: false, error: { message: 'source failed' } }) } });
  await assert.rejects(() => failed.execute({ reply: async () => null }), /source failed/);
  console.log('Community Roadmap presentation tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
