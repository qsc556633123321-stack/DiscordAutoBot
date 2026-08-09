const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M' }, async ({ concierge, guild, roadmap, log }) => {
    roadmap.messages.fetch = async () => ({ id: 'M', async edit() { log.calls.push('roadmap.message.edit'); } });
    await concierge.setupRoadmapPanel(guild);
    assert.ok(log.calls.indexOf('roadmap.message.edit') < log.calls.indexOf('onboarding.write'));
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null }, async ({ concierge, guild, roadmap, log }) => {
    roadmap.send = async () => { log.calls.push('roadmap.message.send'); return { id: 'S' }; };
    await concierge.setupRoadmapPanel(guild);
    assert.ok(log.calls.indexOf('roadmap.message.send') < log.calls.indexOf('onboarding.write'));
  });
  console.log('Roadmap legacy persistence runs after successful mutation');
})().catch((error) => { console.error(error); process.exitCode = 1; });
