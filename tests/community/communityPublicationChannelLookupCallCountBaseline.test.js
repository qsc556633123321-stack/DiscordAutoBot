const assert = require('node:assert');
const { createChannel, withChannelLookupHarness } = require('../helpers/communityPublicationChannelLookupHarness');

(async () => {
  await withChannelLookupHarness({ root: { 'guild-1': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')] }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.onboardingReads, 1);
    assert.equal(metrics.cacheGets.length, 1);
    assert.equal(metrics.cacheFinds, 0);
    assert.equal(metrics.fetches.length, 0);
    assert.equal(metrics.memberSends.length, 1);
    assert.equal(metrics.channelCreates, 0);
    assert.equal(metrics.channelSends, 0);
    assert.equal(metrics.onboardingWrites, 0);
  });
  await withChannelLookupHarness({ root: { 'guild-1': { guideChannelId: 'guide-1' } }, fetchResult: createChannel('guide-1') }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.onboardingReads, 1);
    assert.equal(metrics.cacheGets.length, 1);
    assert.equal(metrics.fetches.length, 1);
    assert.equal(metrics.memberSends.length, 1);
    assert.equal(metrics.onboardingWrites, 0);
  });
  console.log('community publication channel lookup call-count baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
