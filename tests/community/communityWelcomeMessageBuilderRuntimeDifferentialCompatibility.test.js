const assert = require('node:assert');
const fixture = require('../fixtures/community/community-welcome-message-runtime-baseline.json');
const { createChannel, legacyPayload, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

(async () => {
  for (const item of fixture) {
    const fallback = item.route === 'fallback';
    const cachedChannels = item.route === 'fetch' ? [] : [createChannel(item.guideChannelId)];
    const root = fallback ? { [item.guildId]: {} } : { [item.guildId]: { guideChannelId: item.guideChannelId } };
    if (fallback) cachedChannels[0].name = require('../../src/systems/communityConcierge').GUIDE_CHANNEL_NAME;
    await withWelcomeRuntimeHarness({ guildId: item.guildId, guildName: item.guildName, root, cachedChannels, fetchResult: item.route === 'fetch' ? createChannel(item.guideChannelId) : null }, async ({ concierge, member, metrics }) => {
      const result = await concierge.sendConciergeWelcome(member);
      assert.equal(result, undefined);
      assert.deepEqual(metrics.sends[0], legacyPayload(item));
      assert.equal(metrics.writes, 0);
      assert.equal(metrics.mapperCalls.length, 1);
      assert.equal(metrics.builderCalls.length, 1);
    });
  }
  console.log('community welcome message builder runtime differential compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
