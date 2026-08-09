const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const scenario of [{ roadmapMessageId: 'M' }, { roadmapMessageId: 'missing', fetchResult: null }]) {
    await withCommunityRoadmapLookupRuntime({ ...scenario, createPair: createCompatiblePair }, async ({ concierge, guild, roadmap }) => {
      const result = await concierge.setupRoadmapPanel(guild);
      assert.deepEqual(Object.keys(result).sort(), ['channel', 'message']);
      assert.strictEqual(result.channel, roadmap);
      assert.ok(result.message?.id);
    });
  }
  console.log('Roadmap runtime lookup redirect preserves return shape');
})().catch((error) => { console.error(error); process.exitCode = 1; });
