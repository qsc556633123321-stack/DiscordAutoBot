const assert = require('node:assert/strict');
const { concierge, createGuild, createRoadmapChannel, withOnboardingFile } = require('../../helpers/createCommunityRoadmapContinuationHarness');

(async () => {
  for (const raw of [new Error('fetch'), 'fetch', 1, { fetch: true }, null, undefined]) {
    await withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: 'tracked' } } }, async ({ log }) => {
      const roadmap = createRoadmapChannel(log);
      roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); throw raw; };
      const result = await concierge.setupRoadmapPanel(createGuild(log, roadmap));
      assert.equal(result.message.id, 'roadmap-channel-sent');
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    });
  }
  console.log('Community Roadmap lookup rejection swallow passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
