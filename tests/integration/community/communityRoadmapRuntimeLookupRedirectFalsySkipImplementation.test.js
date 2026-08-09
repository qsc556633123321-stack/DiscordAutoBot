const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const roadmapMessageId of [undefined, null, '', 0, false]) {
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId, createPair: createCompatiblePair }, async ({ concierge, guild, log, metrics }) => {
      const result = await concierge.setupRoadmapPanel(guild);
      assert.equal(result.message.id, 'roadmap-channel-sent');
      assert.equal(metrics.lookupCalls, 0);
      assert.equal(metrics.getterCalls, 0);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 0);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    });
  }
  console.log('Roadmap runtime lookup redirect implementation preserves falsy skip');
})().catch((error) => { console.error(error); process.exitCode = 1; });
