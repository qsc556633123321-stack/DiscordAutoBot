const assert = require('node:assert/strict');
const { createCommunityRoadmapFeature } = require('../../../src/composition/communityRoadmapFeature');
const { createCommunityRoadmapCommand } = require('../../../src/presentation/commands/communityRoadmapCommand');
const { createFakeCommunityRoadmapGateway } = require('../../fixtures/communityRoadmapFakes');

async function main() {
  const feature = createCommunityRoadmapFeature({
    gateway: createFakeCommunityRoadmapGateway({
      roadmap: { completed: ['Done'], inProgress: ['Current'], future: ['Later'] }
    })
  });
  const command = createCommunityRoadmapCommand({ useCase: feature.getCommunityRoadmap });
  const calls = [];

  await command.execute({ reply: async (payload) => calls.push(payload) });
  const embed = calls[0].embeds[0].toJSON();

  assert.equal(calls[0].ephemeral, true);
  assert.deepEqual(embed.fields.map((field) => field.name), ['✅ 已完成', '🛠 開發中', '🌌 未來計畫']);
  assert.deepEqual(embed.fields.map((field) => field.value), ['- Done', '- Current', '- Later']);
  assert.match(embed.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  console.log('Community Roadmap vertical slice tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
