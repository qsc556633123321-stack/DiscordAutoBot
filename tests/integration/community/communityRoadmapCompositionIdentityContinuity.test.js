const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapAdapterPairFeature } = require('../../fakes/community/FakeCommunityRoadmapAdapterPairFeature');

(async () => {
  const message = { id: 'M' };
  let fetches = 0;
  const feature = createFakeCommunityRoadmapAdapterPairFeature();
  const pair = feature.createAdapterPair({
    ensuredChannel: { id: 'roadmap', messages: { async fetch() { fetches += 1; return message; } } }
  });
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' }), { kind: 'Available', messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  console.log('Roadmap composition candidate preserves Message identity forecast');
})().catch((error) => { console.error(error); process.exitCode = 1; });
