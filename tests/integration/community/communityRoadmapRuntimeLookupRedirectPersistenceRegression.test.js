const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const scenario of [{ roadmapMessageId: 'M' }, { roadmapMessageId: 'missing', fetchResult: null }]) {
    await withCommunityRoadmapLookupRuntime({ ...scenario, createPair: createCompatiblePair }, async ({ concierge, guild, log, getState }) => {
      const result = await concierge.setupRoadmapPanel(guild);
      const mutation = log.calls.findIndex((call) => call === 'roadmap.message.edit' || call === 'roadmap.message.send');
      const persisted = log.calls.findIndex((call) => call === 'onboarding.write');
      assert.ok(mutation >= 0 && persisted > mutation);
      assert.equal(getState()['guild-1'].roadmapMessageId, result.message.id);
    });
  }
  console.log('Roadmap runtime lookup redirect preserves legacy persistence ordering');
})().catch((error) => { console.error(error); process.exitCode = 1; });
