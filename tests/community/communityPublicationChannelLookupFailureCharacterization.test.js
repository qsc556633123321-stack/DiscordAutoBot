const assert = require('node:assert');
const { createChannel, withChannelLookupHarness } = require('../helpers/communityPublicationChannelLookupHarness');

(async () => {
  const root = { 'guild-1': { guideChannelId: 'guide-1', unknown: { keep: true }, roadmapChannelId: 'roadmap-1', nativeTaskRecommendations: ['entry'] } };
  await withChannelLookupHarness({ root, fetchError: new Error('fetch failed') }, async ({ concierge, member, metrics }) => {
    await assert.doesNotReject(() => concierge.sendConciergeWelcome(member));
    assert.deepEqual(metrics.fetches, ['guide-1']);
    assert.equal(metrics.memberSends.length, 0);
    assert.equal(metrics.onboardingWrites, 0);
  });
  await withChannelLookupHarness({ root, fetchResult: null }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.memberSends.length, 0);
    assert.equal(metrics.onboardingWrites, 0);
  });
  await withChannelLookupHarness({ root, cachedChannels: [createChannel('guide-1')], sendError: new Error('missing permission') }, async ({ concierge, member, metrics }) => {
    await assert.doesNotReject(() => concierge.sendConciergeWelcome(member));
    assert.equal(metrics.memberSends.length, 1);
    assert.equal(metrics.onboardingWrites, 0);
  });
  await withChannelLookupHarness({ root: { 'guild-1': { guideChannelId: { malformed: true } } }, fetchResult: createChannel('guide-object') }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(typeof metrics.fetches[0], 'object', 'truthy malformed IDs are passed to fetch unchanged');
    assert.equal(metrics.memberSends.length, 1);
  });
  await withChannelLookupHarness({ root, readError: new Error('read failed') }, async ({ concierge, member, metrics }) => {
    await assert.doesNotReject(() => concierge.sendConciergeWelcome(member));
    assert.equal(metrics.onboardingReads, 1);
    assert.equal(metrics.memberSends.length, 0);
    assert.equal(metrics.onboardingWrites, 0);
    assert.equal(metrics.logs.length, 1);
  });
  console.log('community publication channel lookup failure characterization passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
