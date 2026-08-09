const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair }, async ({ concierge, guild, log, metrics }) => {
    await concierge.setupRoadmapPanel(guild);
    assert.equal(metrics.lookupCalls, 1);
    assert.equal(metrics.getterCalls, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
  });
  console.log('Roadmap runtime lookup redirect implementation has no second fetch');
})().catch((error) => { console.error(error); process.exitCode = 1; });
