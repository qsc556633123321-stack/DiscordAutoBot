const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

(async () => {
  for (const failure of [new Error('error'), 'string', 1, { code: 'object' }, null, undefined]) {
    const message = { id: 'M', async edit() { return Promise.reject(failure); } };
    const channel = { id: 'roadmap', messages: { async fetch() { return message; } }, async send() { return Promise.reject(failure); } };
    const pair = createCommunityRoadmapAdapterPairFeature().createAdapterPair({ ensuredChannel: channel });
    await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
    await assert.rejects(pair.mutationPort.edit({ messageId: 'M', payload: {} }), (actual) => actual === failure);
    await assert.rejects(pair.mutationPort.send({ payload: {} }), (actual) => actual === failure);
  }
  console.log('Roadmap Composition pass-through preserves exact mutation failures');
})().catch((error) => { console.error(error); process.exitCode = 1; });
