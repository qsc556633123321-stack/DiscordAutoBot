const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    const message = { id: 'M', async edit() { log.calls.push('roadmap.message.edit'); return { id: 'E' }; } };
    roadmap.messages.fetch = async () => message;
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, message);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
    assert.equal(log.writes, 1);
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    const sent = { id: 'S' };
    roadmap.send = async () => { log.calls.push('roadmap.message.send'); return sent; };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, sent);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    assert.equal(log.writes, 1);
  });
  console.log('Roadmap production runtime preserves writer-swallowed partial success');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
