const assert = require('node:assert');
const fixture = require('../fixtures/community/community-welcome-message-runtime-baseline.json');
const { createChannel, legacyPayload, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

(async () => {
  for (const item of fixture.slice(0, 11)) {
    const cachedChannels = item.route === 'fetch' ? [] : [createChannel(item.guideChannelId, { name: item.route === 'fallback' ? undefined : item.guideChannelId })];
    const root = item.route === 'fallback' ? { [item.guildId]: {} } : { [item.guildId]: { guideChannelId: item.guideChannelId } };
    if (item.route === 'fallback') cachedChannels[0].name = require('../../src/systems/communityConcierge').GUIDE_CHANNEL_NAME;
    await withWelcomeRuntimeHarness({ guildId: item.guildId, guildName: item.guildName, root, cachedChannels, fetchResult: item.route === 'fetch' ? createChannel(item.guideChannelId) : null }, async ({ concierge, member, metrics }) => {
      await concierge.sendConciergeWelcome(member);
      assert.deepEqual(metrics.sends, [legacyPayload(item)]);
      assert.equal(metrics.mapperCalls.length, 1);
      assert.equal(metrics.builderCalls.length, 1);
      assert.equal(metrics.reads, 1);
      assert.equal(metrics.writes, 0);
      assert.equal(metrics.logs.length, 0);
      assert.equal(metrics.fetches.length, item.route === 'fetch' ? 1 : 0);
    });
  }
  console.log('community welcome message builder runtime integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
