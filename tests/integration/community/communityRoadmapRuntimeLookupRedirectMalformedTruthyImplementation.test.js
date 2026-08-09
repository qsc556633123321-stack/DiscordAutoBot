const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const roadmapMessageId of ['   ', 'abc', 123, {}, [], true]) {
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId, fetchResult: null, createPair: createCompatiblePair }, async ({ concierge, guild, log, metrics }) => {
      await concierge.setupRoadmapPanel(guild);
      assert.equal(metrics.lookupCalls, 1);
      if (typeof roadmapMessageId === 'object') assert.deepEqual(log.fetchArgs[0], roadmapMessageId);
      else assert.strictEqual(log.fetchArgs[0], roadmapMessageId);
    });
  }
  console.log('Roadmap runtime lookup redirect implementation preserves malformed truthy IDs');
})().catch((error) => { console.error(error); process.exitCode = 1; });
