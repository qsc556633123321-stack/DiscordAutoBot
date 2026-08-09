const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const result of [null, undefined, {}, { kind: 'Unknown' }]) {
    await withCommunityRoadmapLookupRuntime({
      roadmapMessageId: 'tracked',
      createPair: () => ({ lookupPort: { async lookupTrackedMessage() { return result; } }, getRetainedMessage() { throw new Error('getter must not run'); } })
    }, async ({ concierge, guild, log }) => {
      await assert.rejects(() => concierge.setupRoadmapPanel(guild), /Roadmap lookup returned unexpected result/);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
      assert.equal(log.writes, 0);
    });
  }
  console.log('Roadmap runtime lookup redirect rejects unknown lookup results');
})().catch((error) => { console.error(error); process.exitCode = 1; });
