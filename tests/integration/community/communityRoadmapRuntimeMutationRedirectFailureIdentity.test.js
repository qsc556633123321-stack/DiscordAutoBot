const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const failure of [new Error('x'), 'x', 1, { x: true }, null, undefined]) {
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M' }, async ({ concierge, guild, roadmap, log }) => {
      const message = { id: 'M', async edit() { return Promise.reject(failure); } };
      roadmap.messages.fetch = async () => message;
      await assert.rejects(concierge.setupRoadmapPanel(guild), (actual) => actual === failure);
      assert.equal(log.writes, 0);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
    });
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null }, async ({ concierge, guild, roadmap, log }) => {
      roadmap.send = async () => Promise.reject(failure);
      await assert.rejects(concierge.setupRoadmapPanel(guild), (actual) => actual === failure);
      assert.equal(log.writes, 0);
    });
  }
  console.log('Roadmap production runtime preserves exact mutation rejection identity');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
