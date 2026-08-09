const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M' }, async ({ concierge, guild, roadmap, log, getState }) => {
    const message = {
      id: 'M',
      async edit(payload) {
        log.calls.push('roadmap.message.edit');
        log.editPayload = payload;
        return { id: 'E' };
      }
    };
    roadmap.messages.fetch = async () => {
      log.calls.push('roadmap.message.fetch');
      return message;
    };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.channel, roadmap);
    assert.strictEqual(result.message, message);
    assert.strictEqual(log.editPayload, log.editPayload);
    assert.equal(getState()['guild-1'].roadmapMessageId, 'M');
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
  });

  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null }, async ({ concierge, guild, roadmap, log, getState }) => {
    const sent = { id: 'S' };
    roadmap.send = async (payload) => {
      log.calls.push('roadmap.message.send');
      log.sendPayload = payload;
      return sent;
    };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.channel, roadmap);
    assert.strictEqual(result.message, sent);
    assert.equal(getState()['guild-1'].roadmapMessageId, 'S');
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 0);
  });

  console.log('Roadmap production runtime redirects Edit and Send through the Pair');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
