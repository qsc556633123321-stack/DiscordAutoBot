const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityRoadmapRuntimeLookupRedirect');

(async () => {
  const message = { id: 'tracked', async edit() {} };
  let fetches = 0;
  let getterCalls = 0;
  const channel = { id: 'roadmap', messages: { async fetch(id) { fetches += 1; assert.equal(id, 'tracked'); return message; } }, async send() { throw new Error('send must not run'); } };
  const runtime = createFakeCommunityRoadmapRuntimeLookupRedirect({
    getOrCreateRoadmapChannel: async () => channel,
    readOnboardingData: () => ({ guild: { roadmapMessageId: 'tracked' } }),
    fromLegacyPublicationRecord: () => ({ roadmap: { messageId: 'tracked' } }),
    buildRoadmapEmbed: () => ({}), saveOnboarding() {},
    createFeature: () => ({ createAdapterPair: ({ ensuredChannel }) => ({
      lookupPort: { async lookupTrackedMessage({ messageId }) { assert.equal(messageId, 'tracked'); return ensuredChannel.messages.fetch(messageId).then(() => ({ kind: 'Available', messageId })); } },
      getRetainedMessage() { getterCalls += 1; return message; }
    }) })
  });
  const result = await runtime.setupRoadmapPanel({ id: 'guild' });
  assert.strictEqual(result.message, message);
  assert.equal(fetches, 1);
  assert.equal(getterCalls, 1);
  console.log('Roadmap lookup redirect candidate performs no second fetch');
})().catch((error) => { console.error(error); process.exitCode = 1; });
