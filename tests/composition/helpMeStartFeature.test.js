const assert = require('node:assert/strict');
const { createHelpMeStartFeature } = require('../../src/composition/community/helpMeStartFeature');
const { createFakeChannelReader, createFakeTextGenerator, toFacts } = require('../fixtures/helpMeStartFakes');

async function main() {
  const feature = createHelpMeStartFeature({
    guildChannelReader: createFakeChannelReader({ channels: toFacts() }),
    conciergeTextGenerator: createFakeTextGenerator({ value: 'composition text' })
  });
  const result = await feature.getHelpMeStartRecommendation.execute({
    guildId: 'guild-1', guildName: 'Test Guild', answers: { game: '', style: 'chat', onlineTime: 'mixed' }
  });
  assert.equal(result.description, 'composition text');
  assert.deepEqual(result.recommendation.roles, ['🍜 生活閒聊']);
  console.log('Help-me-start composition tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
