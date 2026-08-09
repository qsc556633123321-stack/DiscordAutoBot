const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityRoadmapRuntimeLookupRedirect');

(async () => {
  for (const messageId of [undefined, null, '', 0, false]) {
    let lookups = 0;
    let getters = 0;
    const channel = { id: 'roadmap', messages: { async fetch() { throw new Error('fetch must not run'); } }, async send() { return { id: 'sent' }; } };
    const runtime = createFakeCommunityRoadmapRuntimeLookupRedirect({
      getOrCreateRoadmapChannel: async () => channel,
      readOnboardingData: () => ({ guild: { roadmapMessageId: messageId } }),
      fromLegacyPublicationRecord: () => ({ roadmap: { messageId } }), buildRoadmapEmbed: () => ({}), saveOnboarding() {},
      createFeature: () => ({ createAdapterPair: () => ({ lookupPort: { async lookupTrackedMessage() { lookups += 1; } }, getRetainedMessage() { getters += 1; } }) })
    });
    const result = await runtime.setupRoadmapPanel({ id: 'guild' });
    assert.equal(result.message.id, 'sent');
    assert.equal(lookups, 0);
    assert.equal(getters, 0);
  }
  console.log('Roadmap lookup redirect candidate preserves falsy ID skip');
})().catch((error) => { console.error(error); process.exitCode = 1; });
