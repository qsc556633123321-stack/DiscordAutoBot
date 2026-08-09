const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({
    roadmapMessageId: 'tracked',
    createPair: () => ({ lookupPort: { async lookupTrackedMessage() { return { kind: 'Available', messageId: 'tracked' }; } }, getRetainedMessage() { return null; } })
  }, async ({ concierge, guild, log }) => {
    await assert.rejects(() => concierge.setupRoadmapPanel(guild), /Roadmap lookup returned Available without retained message/);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 0);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
    assert.equal(log.writes, 0);
  });
  console.log('Roadmap runtime lookup redirect rejects Available without retained message');
})().catch((error) => { console.error(error); process.exitCode = 1; });
