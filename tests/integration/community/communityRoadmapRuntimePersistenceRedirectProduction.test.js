const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'edit-message' }, async ({ concierge, guild, roadmap, log, getState }) => {
    const message = {
      id: 'edit-message',
      async edit() {
        log.calls.push('roadmap.message.edit');
        return this;
      }
    };
    roadmap.messages.fetch = async () => message;
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.channel, roadmap);
    assert.strictEqual(result.message, message);
    assert.equal(getState()['guild-1'].roadmapChannelId, roadmap.id);
    assert.equal(getState()['guild-1'].roadmapMessageId, message.id);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
    assert.ok(log.calls.indexOf('roadmap.message.edit') < log.calls.lastIndexOf('onboarding.write'));
  });

  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null }, async ({ concierge, guild, roadmap, log, getState }) => {
    const message = { id: 'send-message' };
    roadmap.send = async () => {
      log.calls.push('roadmap.message.send');
      return message;
    };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.channel, roadmap);
    assert.strictEqual(result.message, message);
    assert.equal(getState()['guild-1'].roadmapChannelId, roadmap.id);
    assert.equal(getState()['guild-1'].roadmapMessageId, message.id);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
    assert.ok(log.calls.indexOf('roadmap.message.send') < log.calls.lastIndexOf('onboarding.write'));
  });

  console.log('Roadmap runtime persistence redirect preserves production Edit/Send IDs and ordering.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
