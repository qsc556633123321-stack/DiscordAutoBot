const assert = require('node:assert');
const { createChannel, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

const base = { guildId: 'result-guild', guildName: 'Result Guild', root: { 'result-guild': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')] };

(async () => {
  for (const sendValue of [{ id: 'message-like' }, undefined]) {
    await withWelcomeRuntimeHarness({ ...base, sendValue }, async ({ concierge, member, metrics }) => {
      assert.equal(await concierge.sendConciergeWelcome(member), undefined);
      assert.equal(metrics.sends.length, 1);
      assert.equal(metrics.writes, 0);
    });
  }
  await withWelcomeRuntimeHarness({ ...base, cachedChannels: [] }, async ({ concierge, member, metrics }) => {
    assert.equal(await concierge.sendConciergeWelcome(member), undefined);
    assert.equal(metrics.sends.length, 0);
  });
  await withWelcomeRuntimeHarness({ ...base, cachedChannels: [], fetchResult: createChannel('guide-1') }, async ({ concierge, member, metrics }) => {
    assert.equal(await concierge.sendConciergeWelcome(member), undefined);
    assert.deepEqual(metrics.fetches, ['guide-1']);
    assert.equal(metrics.sends.length, 1);
  });
  await withWelcomeRuntimeHarness({ ...base, cachedChannels: [], fetchError: new Error('fetch failure') }, async ({ concierge, member, metrics }) => {
    assert.equal(await concierge.sendConciergeWelcome(member), undefined);
    assert.equal(metrics.sends.length, 0);
  });
  await withWelcomeRuntimeHarness(base, async ({ concierge, member, metrics }) => {
    await concierge.sendConciergeWelcome(member);
    await concierge.sendConciergeWelcome(member);
    assert.equal(metrics.sends.length, 2);
    assert.equal(metrics.writes, 0);
  });
  console.log('community welcome delivery runtime return baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
