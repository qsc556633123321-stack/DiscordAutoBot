const assert = require('node:assert');
const { createChannel, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

const base = { guildId: 'error-guild', guildName: 'Error Guild', root: { 'error-guild': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')] };

(async () => {
  await withWelcomeRuntimeHarness({ ...base, sendError: new Error('rejected') }, async ({ concierge, member, metrics }) => {
    assert.equal(await concierge.sendConciergeWelcome(member), undefined);
    assert.equal(metrics.sends.length, 1);
  });
  for (const options of [
    { sendSyncError: new Error('sync send') },
    { cacheGetError: new Error('cache get') },
    { sendMissing: true },
    { fetchMissing: true, cachedChannels: [] }
  ]) {
    await withWelcomeRuntimeHarness({ ...base, ...options }, async ({ concierge, member }) => {
      await assert.rejects(() => concierge.sendConciergeWelcome(member));
    });
  }
  await withWelcomeRuntimeHarness({ ...base, readError: new Error('read failed'), cachedChannels: [] }, async ({ concierge, member, metrics }) => {
    assert.equal(await concierge.sendConciergeWelcome(member), undefined);
    assert.equal(metrics.sends.length, 0);
    assert.equal(metrics.logs.length, 1);
  });
  await withWelcomeRuntimeHarness(base, async ({ concierge }) => {
    await assert.rejects(() => concierge.sendConciergeWelcome({}), TypeError);
    await assert.rejects(() => concierge.sendConciergeWelcome({ guild: { id: 'x' } }), TypeError);
  });
  console.log('community welcome delivery thrown/swallowed baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
