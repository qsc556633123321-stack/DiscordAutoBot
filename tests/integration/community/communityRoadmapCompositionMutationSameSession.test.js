const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

(async () => {
  const message = { id: 'M', async edit() { return { id: 'E' }; } };
  const channel = { id: 'roadmap', messages: { async fetch() { return message; } }, async send() { return { id: 'S' }; } };
  const feature = createCommunityRoadmapAdapterPairFeature();
  const pair = feature.createAdapterPair({ ensuredChannel: channel });
  await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'M', payload: {} }), { kind: 'EditSuccess', messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.deepEqual(await pair.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'S' });
  console.log('Roadmap Composition pass-through preserves Pair shared Session behavior');
})().catch((error) => { console.error(error); process.exitCode = 1; });
