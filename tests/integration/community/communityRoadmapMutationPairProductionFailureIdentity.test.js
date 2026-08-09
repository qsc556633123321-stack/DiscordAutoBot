const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  for (const failure of [new Error('error'), 'string', 1, { code: 'object' }, null, undefined]) {
    const message = { id: 'M', async edit() { return Promise.reject(failure); } };
    const channel = { id: 'roadmap', messages: { async fetch() { return message; } }, async send() { return Promise.reject(failure); } };
    const pair = createRoadmapPublicationAdapterPair({ ensuredChannel: channel });
    await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
    await assert.rejects(pair.mutationPort.edit({ messageId: 'M', payload: {} }), (actual) => actual === failure);
    await assert.rejects(pair.mutationPort.send({ payload: {} }), (actual) => actual === failure);
    assert.equal('getRetainedMutationFailure' in pair, false);
  }
  console.log('Roadmap production Pair preserves raw mutation failure identity');
})().catch((error) => { console.error(error); process.exitCode = 1; });
