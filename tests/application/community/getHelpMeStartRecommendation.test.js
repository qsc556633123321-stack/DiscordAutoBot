const assert = require('node:assert/strict');
const { HELP_ME_START_FALLBACK, createGetHelpMeStartRecommendation } = require('../../../src/application/community/getHelpMeStartRecommendation');
const { createFakeChannelReader, createFakeTextGenerator, toFacts } = require('../../fixtures/helpMeStartFakes');

async function main() {
  const reader = createFakeChannelReader({ channels: toFacts() });
  const generator = createFakeTextGenerator({ value: 'AI 建議文字' });
  const useCase = createGetHelpMeStartRecommendation({ guildChannelReader: reader, conciergeTextGenerator: generator });
  const answers = { game: 'TFT', style: 'rank', onlineTime: 'late' };
  const result = await useCase.execute({ guildId: 'guild-1', guildName: 'Test Guild', answers });

  assert.equal(result.description, 'AI 建議文字');
  assert.deepEqual(reader.calls, ['guild-1']);
  assert.deepEqual(generator.calls, [{
    kind: 'help_me_start',
    context: { guildName: 'Test Guild', answers, recommendation: result.recommendation },
    fallback: HELP_ME_START_FALLBACK
  }]);

  const fallback = createFakeTextGenerator();
  const fallbackResult = await createGetHelpMeStartRecommendation({ guildChannelReader: reader, conciergeTextGenerator: fallback })
    .execute({ guildId: 'guild-1', guildName: 'Test Guild', answers: { game: '', style: 'chat', onlineTime: 'mixed' } });
  assert.equal(fallbackResult.description, HELP_ME_START_FALLBACK);

  await assert.rejects(
    () => createGetHelpMeStartRecommendation({
      guildChannelReader: createFakeChannelReader({ error: new Error('reader failed') }),
      conciergeTextGenerator: generator
    }).execute({ guildId: 'guild-1', guildName: 'Test Guild', answers }),
    /reader failed/
  );
  await assert.rejects(
    () => createGetHelpMeStartRecommendation({
      guildChannelReader: reader,
      conciergeTextGenerator: createFakeTextGenerator({ error: new Error('generator failed') })
    }).execute({ guildId: 'guild-1', guildName: 'Test Guild', answers }),
    /generator failed/
  );
  console.log('Help-me-start application tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
