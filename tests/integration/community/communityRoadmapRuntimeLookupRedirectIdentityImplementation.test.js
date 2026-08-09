const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log }) => {
    const fetched = { id: 'M', async edit(payload) { log.editReceiver = this; log.lastEditPayload = payload; } };
    roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); return fetched; };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, fetched);
    assert.strictEqual(log.editReceiver, fetched);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
  });
  console.log('Roadmap runtime lookup redirect preserves exact message identity');
})().catch((error) => { console.error(error); process.exitCode = 1; });
