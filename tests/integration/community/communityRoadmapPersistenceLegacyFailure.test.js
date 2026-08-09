const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    const message = { id: 'M', async edit() {} };
    roadmap.messages.fetch = async () => message;
    assert.strictEqual((await concierge.setupRoadmapPanel(guild)).message, message);
    assert.equal(log.writes, 1);
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    const sent = { id: 'S' };
    roadmap.send = async () => sent;
    assert.strictEqual((await concierge.setupRoadmapPanel(guild)).message, sent);
    assert.equal(log.writes, 1);
  });
  console.log('Roadmap legacy persistence write failures are logged and swallowed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
