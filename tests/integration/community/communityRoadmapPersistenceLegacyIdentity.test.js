const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M-raw' }, async ({ concierge, guild, roadmap, getState }) => {
    const message = { id: 'M-raw', async edit() {} };
    roadmap.messages.fetch = async () => message;
    await concierge.setupRoadmapPanel(guild);
    assert.equal(getState()['guild-1'].roadmapChannelId, roadmap.id);
    assert.equal(getState()['guild-1'].roadmapMessageId, message.id);
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null }, async ({ concierge, guild, roadmap, getState }) => {
    const message = { id: 'S-raw' };
    roadmap.send = async () => message;
    await concierge.setupRoadmapPanel(guild);
    assert.equal(getState()['guild-1'].roadmapChannelId, roadmap.id);
    assert.equal(getState()['guild-1'].roadmapMessageId, message.id);
  });
  console.log('Roadmap persistence retains exact guild, channel, and message identities');
})().catch((error) => { console.error(error); process.exitCode = 1; });
