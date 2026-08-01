const assert = require('node:assert');
const { createChannel, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

(async () => {
  const base = { guildId: 'guild-1', guildName: '科幻基地' };
  await withWelcomeRuntimeHarness({ ...base, root: { 'guild-1': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')] }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.deepEqual(metrics.cacheGets, ['guide-1']);
    assert.equal(metrics.fetches.length, 0);
  });
  await withWelcomeRuntimeHarness({ ...base, root: { 'guild-1': { guideChannelId: 'guide-1' } }, fetchResult: createChannel('guide-1') }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.deepEqual(metrics.fetches, ['guide-1']);
  });
  const guideName = require('../../src/systems/communityConcierge').GUIDE_CHANNEL_NAME;
  await withWelcomeRuntimeHarness({ ...base, root: { 'guild-1': {} }, cachedChannels: [createChannel('fallback', { name: guideName })] }, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.cacheGets.length, 0);
    assert.equal(metrics.cacheFinds, 1);
  });
  await withWelcomeRuntimeHarness({ ...base, root: { 'guild-1': { guideChannelId: { malformed: true } } }, fetchError: new Error('fetch') }, async ({ concierge, member, metrics }) => {
    await assert.doesNotReject(() => concierge.sendConciergeWelcome(member));
    assert.equal(typeof metrics.fetches[0], 'object');
    assert.equal(metrics.sends.length, 0);
    assert.equal(metrics.mapperCalls.length, 0);
  });
  console.log('community channel lookup non-regression after welcome builder integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
