const assert = require('node:assert');
const { createChannel, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

(async () => {
  await withWelcomeRuntimeHarness({ guildId: 'count-guild', guildName: 'Count Guild', root: { 'count-guild': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')] }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.reads, 1);
    assert.equal(metrics.cacheGets.length, 1);
    assert.equal(metrics.fetches.length, 0);
    assert.equal(metrics.cacheFinds, 0);
    assert.equal(metrics.mapperCalls.length, 1);
    assert.equal(metrics.builderCalls.length, 1);
    assert.equal(metrics.sends.length, 1);
    assert.equal(metrics.writes, 0);
  });
  await withWelcomeRuntimeHarness({ guildId: 'count-none', guildName: 'Count None', root: { 'count-none': {} }, cachedChannels: [] }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.reads, 1);
    assert.equal(metrics.cacheFinds, 1);
    assert.equal(metrics.mapperCalls.length, 0);
    assert.equal(metrics.builderCalls.length, 0);
    assert.equal(metrics.sends.length, 0);
    assert.equal(metrics.writes, 0);
  });
  console.log('community welcome delivery result call-count baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
