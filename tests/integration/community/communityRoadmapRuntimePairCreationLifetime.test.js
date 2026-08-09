const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapRuntimeWithUnusedPair } = require('../../fakes/community/FakeCommunityRoadmapRuntimeWithUnusedPair');

(async () => {
  const channel = { id: 'same', messages: { async fetch() { return null; } }, async send() { return { id: 'sent' }; } };
  const pairs = [];
  const runtime = createFakeCommunityRoadmapRuntimeWithUnusedPair({
    getOrCreateRoadmapChannel: async () => channel,
    readOnboardingData: () => ({ guild: {} }),
    fromLegacyPublicationRecord: () => ({ roadmap: {} }),
    buildRoadmapEmbed: () => ({}),
    saveOnboarding() {},
    createFeature: () => ({ createAdapterPair(input) { const pair = { input }; pairs.push(pair); return pair; } })
  });
  await runtime.setupRoadmapPanel({ id: 'guild' });
  await runtime.setupRoadmapPanel({ id: 'guild' });
  assert.equal(pairs.length, 2);
  assert.notStrictEqual(pairs[0], pairs[1]);
  assert.strictEqual(pairs[0].input.ensuredChannel, channel);
  assert.strictEqual(pairs[1].input.ensuredChannel, channel);
  console.log('Roadmap runtime Pair lifetime is per invocation');
})().catch((error) => { console.error(error); process.exitCode = 1; });
