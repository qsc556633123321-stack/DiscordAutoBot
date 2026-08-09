const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityRoadmapRuntimeLookupRedirect');

(async () => {
  for (const rejection of [new Error('error'), 'string', 3, { bad: true }, null, undefined]) {
    let fetches = 0;
    let sends = 0;
    const channel = { id: 'roadmap', messages: { async fetch() { fetches += 1; throw rejection; } }, async send() { sends += 1; return { id: 'sent' }; } };
    const runtime = createFakeCommunityRoadmapRuntimeLookupRedirect({
      getOrCreateRoadmapChannel: async () => channel,
      readOnboardingData: () => ({ guild: { roadmapMessageId: 'tracked' } }),
      fromLegacyPublicationRecord: () => ({ roadmap: { messageId: 'tracked' } }), buildRoadmapEmbed: () => ({}), saveOnboarding() {}
    });
    const result = await runtime.setupRoadmapPanel({ id: 'guild' });
    assert.equal(result.message.id, 'sent');
    assert.equal(fetches, 1);
    assert.equal(sends, 1);
  }
  console.log('Roadmap lookup redirect candidate preserves rejection swallowing');
})().catch((error) => { console.error(error); process.exitCode = 1; });
