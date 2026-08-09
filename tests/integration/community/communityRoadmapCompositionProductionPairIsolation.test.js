const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

(async () => {
  const message = { id: 'M' };
  const channel = { id: 'roadmap', messages: { async fetch() { return message; } }, async send() { return { id: 'sent' }; } };
  const feature = createCommunityRoadmapAdapterPairFeature();
  const first = feature.createAdapterPair({ ensuredChannel: channel });
  const second = feature.createAdapterPair({ ensuredChannel: channel });
  assert.notStrictEqual(first, second);
  await first.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  assert.strictEqual(first.getRetainedMessage(), message);
  assert.equal(second.getRetainedMessage(), null);
  console.log('Roadmap production composition keeps Pair state isolated');
})().catch((error) => { console.error(error); process.exitCode = 1; });
