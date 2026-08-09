const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const rejection of [new Error('error'), 'string', 7, { bad: true }, null, undefined]) {
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'tracked', rejection, createPair: createCompatiblePair }, async ({ concierge, guild, log, metrics }) => {
      const result = await concierge.setupRoadmapPanel(guild);
      assert.equal(result.message.id, 'roadmap-channel-sent');
      assert.equal(metrics.lookupCalls, 1);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    });
  }
  console.log('Roadmap runtime lookup redirect implementation swallows lookup rejections');
})().catch((error) => { console.error(error); process.exitCode = 1; });
