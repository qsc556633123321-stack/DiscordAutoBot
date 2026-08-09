const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log, metrics }) => {
    const result = await concierge.setupRoadmapPanel(guild);
    assert.equal(metrics.lookupCalls, 1);
    assert.equal(metrics.getterCalls, 1);
    assert.deepEqual(log.fetchArgs, ['M']);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
    assert.strictEqual(result.channel, roadmap);
    assert.equal(result.message.id, 'M');
  });
  console.log('Roadmap runtime lookup redirect implementation maps Available to edit');
})().catch((error) => { console.error(error); process.exitCode = 1; });
