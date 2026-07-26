const assert = require('node:assert');
const cases = require('../fixtures/community/community-publication-channel-lookup-cases.json');
const { createChannel, withChannelLookupHarness } = require('../helpers/communityPublicationChannelLookupHarness');

(async () => {
  assert.equal(cases.length, 30, 'frozen fixture must contain CL-F01 through CL-F30');
  for (const item of cases) assert.match(item.id, /^CL-F(?:0[1-9]|[12][0-9]|30)$/);

  await withChannelLookupHarness({ root: cases[0].root }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.onboardingReads, 1);
    assert.equal(metrics.cacheFinds, 1);
    assert.equal(metrics.fetches.length, 0);
    assert.equal(metrics.memberSends.length, 0);
    assert.equal(metrics.onboardingWrites, 0);
  });

  await withChannelLookupHarness({
    root: cases[6].root,
    cachedChannels: [createChannel('guide-1')]
  }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.deepEqual(metrics.cacheGets, ['guide-1']);
    assert.equal(metrics.fetches.length, 0);
    assert.equal(metrics.memberSends.length, 1);
    assert.match(metrics.memberSends[0].content, /guide-1/);
    assert.equal(metrics.onboardingWrites, 0);
  });

  await withChannelLookupHarness({
    root: cases[14].root,
    fetchResult: createChannel('guide-1')
  }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.deepEqual(metrics.cacheGets, ['guide-1']);
    assert.deepEqual(metrics.fetches, ['guide-1']);
    assert.equal(metrics.memberSends.length, 1);
    assert.equal(metrics.channelCreates, 0);
    assert.equal(metrics.channelSends, 0);
    assert.equal(metrics.onboardingWrites, 0);
  });

  await withChannelLookupHarness({
    root: cases[4].root,
    cachedChannels: [createChannel('fallback', { name: require('../../src/systems/communityConcierge').GUIDE_CHANNEL_NAME })]
  }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.cacheGets.length, 0);
    assert.equal(metrics.cacheFinds, 1);
    assert.equal(metrics.memberSends.length, 1);
  });

  await withChannelLookupHarness({
    root: cases[17].root,
    cachedChannels: [createChannel('voice-1', { type: 2 })]
  }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.memberSends.length, 1, 'legacy path does not validate a text channel');
    assert.equal(metrics.onboardingWrites, 0);
  });

  await withChannelLookupHarness({
    root: cases[27].root,
    cachedChannels: [createChannel('guide-1')]
  }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.onboardingReads, 2);
    assert.equal(metrics.memberSends.length, 2);
    assert.equal(metrics.onboardingWrites, 0);
  });

  console.log('community publication channel lookup pre-integration baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
