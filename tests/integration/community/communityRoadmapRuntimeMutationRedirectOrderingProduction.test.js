const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M' }, async ({ concierge, guild, roadmap, log }) => {
    const message = { id: 'M', async edit(payload) { log.calls.push('roadmap.message.edit'); log.payload = payload; } };
    roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); return message; };
    await concierge.setupRoadmapPanel(guild);
    assert.ok(log.calls.indexOf('roadmap.message.fetch') < log.calls.indexOf('roadmap.message.edit'));
    assert.ok(log.calls.indexOf('roadmap.message.edit') < log.calls.indexOf('onboarding.write'));
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null }, async ({ concierge, guild, roadmap, log }) => {
    roadmap.send = async (payload) => { log.calls.push('roadmap.message.send'); log.payload = payload; return { id: 'S' }; };
    await concierge.setupRoadmapPanel(guild);
    assert.ok(log.calls.indexOf('roadmap.message.send') < log.calls.indexOf('onboarding.write'));
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
  });
  console.log('Roadmap production runtime preserves mutation-before-persistence ordering');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
