const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log }) => {
    const message = { id: 'M', async edit() { log.calls.push('edit'); return { id: 'E' }; } };
    roadmap.messages.fetch = async () => message;
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.channel, roadmap);
    assert.strictEqual(result.message, message);
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, createPair: createCompatiblePair }, async ({ concierge, guild, roadmap }) => {
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.channel, roadmap);
    assert.equal(result.message.id, 'roadmap-channel-sent');
  });
  console.log('Roadmap legacy runtime return identity characterized');
})().catch((error) => { console.error(error); process.exitCode = 1; });
