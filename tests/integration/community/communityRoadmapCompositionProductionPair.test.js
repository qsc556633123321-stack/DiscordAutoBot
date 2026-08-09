const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

(async () => {
  const message = { id: 'M' };
  let fetches = 0;
  const feature = createCommunityRoadmapAdapterPairFeature();
  const pair = feature.createAdapterPair({
    ensuredChannel: { id: 'roadmap', messages: { async fetch() { fetches += 1; return message; } }, async send() { return { id: 'sent' }; } }
  });
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' }), { kind: 'Available', messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  console.log('Roadmap production composition delegates to production Pair');
})().catch((error) => { console.error(error); process.exitCode = 1; });
