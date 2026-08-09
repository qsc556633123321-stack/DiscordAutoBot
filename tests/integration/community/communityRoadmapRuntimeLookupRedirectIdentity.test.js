const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityRoadmapRuntimeLookupRedirect');

(async () => {
  const message = { id: 'M', async edit() { assert.strictEqual(this, message); } };
  let retained = null;
  const channel = { id: 'roadmap', messages: { async fetch() { retained = message; return message; } }, async send() { throw new Error('send must not run'); } };
  const runtime = createFakeCommunityRoadmapRuntimeLookupRedirect({
    getOrCreateRoadmapChannel: async () => channel,
    readOnboardingData: () => ({ guild: { roadmapMessageId: 'M' } }),
    fromLegacyPublicationRecord: () => ({ roadmap: { messageId: 'M' } }), buildRoadmapEmbed: () => ({}), saveOnboarding() {}
  });
  const result = await runtime.setupRoadmapPanel({ id: 'guild' });
  assert.strictEqual(retained, message);
  assert.strictEqual(result.message, message);
  const invariantRuntime = createFakeCommunityRoadmapRuntimeLookupRedirect({
    getOrCreateRoadmapChannel: async () => channel, readOnboardingData: () => ({ guild: { roadmapMessageId: 'M' } }),
    fromLegacyPublicationRecord: () => ({ roadmap: { messageId: 'M' } }), buildRoadmapEmbed: () => ({}), saveOnboarding() {},
    createFeature: () => ({ createAdapterPair: () => ({ lookupPort: { async lookupTrackedMessage() { return { kind: 'Available', messageId: 'M' }; } }, getRetainedMessage() { return null; } }) })
  });
  await assert.rejects(() => invariantRuntime.setupRoadmapPanel({ id: 'guild' }), /requires a retained message/);
  console.log('Roadmap lookup redirect candidate preserves message identity and invariant');
})().catch((error) => { console.error(error); process.exitCode = 1; });
