const assert = require('node:assert');
const { createChannel, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

(async () => {
  const options = { guildId: 'guild-1', guildName: '科幻基地', root: { 'guild-1': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')] };
  await withWelcomeRuntimeHarness(options, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.reads, 1);
    assert.equal(metrics.cacheGets.length, 1);
    assert.equal(metrics.fetches.length, 0);
    assert.equal(metrics.cacheFinds, 0);
    assert.equal(metrics.mapperCalls.length, 1);
    assert.equal(metrics.builderCalls.length, 1);
    assert.equal(metrics.sends.length, 1);
    assert.equal(metrics.writes, 0);
    assert.equal(metrics.logs.length, 0);
  });
  await withWelcomeRuntimeHarness({ ...options, sendError: new Error('DM rejected') }, async ({ concierge, member, metrics }) => {
    assert.equal(await concierge.sendConciergeWelcome(member), undefined);
    assert.equal(metrics.sends.length, 1);
    assert.equal(metrics.mapperCalls.length, 1);
    assert.equal(metrics.builderCalls.length, 1);
    assert.equal(metrics.writes, 0);
  });
  console.log('community welcome message builder runtime call count passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
